import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';
import { TransactionService } from '../common/transaction.service';
import { ActivityType } from '../common/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email }
      });
      
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash the password before saving
      const passwordHash = await bcrypt.hash(createUserDto.password, 10);
      
      const userData = {
        ...createUserDto,
        password: passwordHash,
        isVerified: true, // Admin-created users are automatically verified
      };

      const user = await this.prisma.user.create({ 
        data: userData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password from response
        }
      });

      // Log user creation transaction
      await this.transactionService.logActivity(
        user.id,
        ActivityType.USER_ACTIVATED,
        `User account created by admin - Role: ${user.role}`
      );
      
      return user;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll() {
    return this.prisma.user.findMany({ 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password, otp, otpExpiry, refreshToken
      }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        // Exclude sensitive fields
      }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Prepare update data
      const updateData: any = { ...updateUserDto };

      // Hash password if it's being updated
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.prisma.user.update({ 
        where: { id }, 
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive fields
        }
      });
      
      return updatedUser;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      if (error?.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { message: 'User deleted successfully' };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}
