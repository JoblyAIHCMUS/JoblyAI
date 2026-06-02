import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDTO {
  @ApiProperty({
    description: 'The ID of the user who will receive the notification',
  })
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @ApiProperty({
    description: 'Type of notification (e.g., NEW_MESSAGE, APPLICATION_STATUS)',
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

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
