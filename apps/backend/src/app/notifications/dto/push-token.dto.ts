import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPushTokenDTO {
  @ApiProperty({
    description: 'Expo push token for this device',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  })
  @IsString()
  @Matches(/^Expo(nent)?PushToken\[[\w-]+\]$/)
  token!: string;

  @ApiPropertyOptional({ description: 'Device platform, e.g. ios or android' })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({ description: 'Client-generated device identifier' })
  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class UnregisterPushTokenDTO {
  @ApiProperty({
    description: 'Expo push token to remove for this device',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  })
  @IsString()
  @Matches(/^Expo(nent)?PushToken\[[\w-]+\]$/)
  token!: string;
}
