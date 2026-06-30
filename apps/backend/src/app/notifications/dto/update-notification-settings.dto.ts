import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDTO {
  @ApiPropertyOptional({
    description: 'Enable notifications related to job applications',
  })
  @IsBoolean()
  @IsOptional()
  applications?: boolean;

  @ApiPropertyOptional({
    description: 'Enable notifications related to matching or relevant jobs',
  })
  @IsBoolean()
  @IsOptional()
  jobs?: boolean;

  @ApiPropertyOptional({
    description: 'Enable personalized recommendation notifications',
  })
  @IsBoolean()
  @IsOptional()
  recommendations?: boolean;

  @ApiPropertyOptional({
    description: 'Enable message notifications',
  })
  @IsBoolean()
  @IsOptional()
  messages?: boolean;
}
