import { Body, Controller, Post, Get, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Response } from 'express';
import { parseDurationMs } from './utils/parse-duration';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      sameSite: isProd ? 'none' as const : 'lax' as const,
      secure: isProd,
      path: '/',
    };

    // Access token cookie (short lived)
    const accessMaxAgeMs = parseDurationMs(process.env.JWT_ACCESS_EXPIRES_IN) ?? 15 * 60 * 1000;
    res.cookie('accessToken', accessToken, { ...cookieBase, maxAge: accessMaxAgeMs });

    // Refresh token cookie (longer lived)
    const refreshMaxAgeMs = parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN) ?? 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', refreshToken, { ...cookieBase, maxAge: refreshMaxAgeMs });

    // Return both user and tokens for NextAuth compatibility
    return { user, accessToken, refreshToken };
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    // Clear cookies regardless of token state
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return this.authService.logout(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: any) {
    return { user };
  }
}

