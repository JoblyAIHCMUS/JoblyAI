import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../notification-type.enum';

export class CreateNotificationDTO {
  @ApiProperty({
    description: 'The ID of the user who will receive the notification',
  })
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @ApiProperty({ description: 'Title of the notification' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Content of the notification' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    description: 'Link to redirect when the notification is clicked',
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ description: 'Extra metadata for the notification' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
