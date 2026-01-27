import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPhoneDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Registered phone number',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({
    example: '1234',
    description: '4-digit OTP sent to phone',
    minLength: 4,
    maxLength: 4,
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address',
  })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Phone number associated with the account',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Registered phone number',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({
    example: '1234',
    description: '4-digit OTP',
    minLength: 4,
    maxLength: 4,
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  otp: string;

  @ApiProperty({
    example: 'NewStrong@123',
    description: 'New password for the account',
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}

// Keep old DTOs for backward compatibility
export class VerifyEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: '654321',
    description: '6-digit OTP sent to email',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
