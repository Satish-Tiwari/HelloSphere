import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationTiming,
  NotificationType,
} from 'src/schemas/notification.schema';

export class CreateSmsNotificationDto {
  @ApiProperty({
    example: 'EVT_123456',
    description: 'Unique event identifier',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    example: ['9876543210', '9123456789'],
    description: 'List of recipient phone numbers',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  recipients: string[];

  @ApiPropertyOptional({
    enum: NotificationType,
    example: NotificationType.SMS,
    description: 'Type of notification',
    default: NotificationType.SMS,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  notificationType?: NotificationType = NotificationType.SMS;

  @ApiPropertyOptional({
    example: 'OTP Verification',
    description: 'Optional SMS subject or tag',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    example: 'Your OTP is 123456. Do not share it with anyone.',
    description: 'SMS message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    enum: NotificationTiming,
    example: NotificationTiming.IMMEDIATE,
    description: 'When the SMS should be sent',
    default: NotificationTiming.IMMEDIATE,
  })
  @IsEnum(NotificationTiming)
  @IsOptional()
  timing?: NotificationTiming = NotificationTiming.IMMEDIATE;
}

export class SendBulkSmsDto {
  @ApiProperty({
    example: ['9876543210', '9123456789', '9988776655'],
    description: 'Phone numbers to receive the SMS',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  phoneNumbers: string[];

  @ApiProperty({
    example: 'System maintenance scheduled at 11 PM.',
    description: 'Message to be sent to all recipients',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ValidatePhoneNumberDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Phone number to validate',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
