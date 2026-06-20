import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceDTO {
  @ApiProperty({ enum: ['android', 'ios'] })
  @IsIn(['android', 'ios'])
  platform!: 'android' | 'ios';

  @ApiProperty({ description: 'Native Firebase device registration token' })
  @IsString()
  @IsNotEmpty()
  pushToken!: string;
}
