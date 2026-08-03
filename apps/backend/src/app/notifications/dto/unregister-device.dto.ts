import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UnregisterDeviceDTO {
  @ApiProperty({ description: 'Native Firebase device registration token' })
  @IsString()
  @IsNotEmpty()
  pushToken!: string;
}
