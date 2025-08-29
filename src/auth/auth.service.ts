import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { TransactionService } from '../common/transaction.service';
import { ActivityType } from '../common/enums';
import * as bcrypt from 'bcrypt';
import { MailerService } from './mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
    private readonly transactionService: TransactionService,
  ) {}

  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private async signTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        role: dto.role,
        isVerified: false,
        otp,
        otpExpiry,
      },
    });

    await this.mailer.sendOtpEmail(dto.email, 'Verify your email', otp);
    return { message: 'Registration successful. Verify email with OTP sent.' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('Invalid email');
    if (!user.otp || !user.otpExpiry)
      throw new BadRequestException('No OTP generated');
    if (user.isVerified) return { message: 'Email already verified' };
    if (user.otp !== dto.otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.otpExpiry)
      throw new BadRequestException('OTP expired');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otp: null, otpExpiry: null },
    });
    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isVerified) throw new UnauthorizedException('Email not verified');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.signTokens({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Log successful login
    await this.transactionService.logActivity(
      user.id,
      ActivityType.USER_ACTIVATED,
      `User logged in successfully`
    );

    // Remove sensitive information from user object
    const { password, otp, otpExpiry, refreshToken: _, ...userInfo } = user;
    return {
      user: userInfo,
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) return { message: 'If the email exists, OTP has been sent' };

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });
    await this.mailer.sendOtpEmail(dto.email, 'Reset your password', otp);
    return { message: 'OTP sent if the email exists' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.otp || !user.otpExpiry)
      throw new BadRequestException('Invalid request');
    if (user.otp !== dto.otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.otpExpiry)
      throw new BadRequestException('OTP expired');
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash, otp: null, otpExpiry: null },
    });
    return { message: 'Password reset successful' };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      if (!dto.refreshToken) {
        throw new UnauthorizedException('Refresh token is required');
      }

      const payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== dto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.signTokens({
        id: user.id,
        email: user.email,
        role: user.role as any,
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(dto: RefreshTokenDto) {
    try {
      // Skip token verification if no token or empty string
      if (!dto.refreshToken) {
        return { message: 'Logged out' };
      }

      const payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload?.sub) {
        // Clear refresh token from database only if we have a valid user ID
        await this.prisma.user.update({
          where: { id: payload.sub },
          data: { refreshToken: null },
        });
      }
    } catch (error) {
      // Ignore verification errors during logout
    }

    return { message: 'Logged out' };
  }
}
