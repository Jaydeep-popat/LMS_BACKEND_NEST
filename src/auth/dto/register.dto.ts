import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

