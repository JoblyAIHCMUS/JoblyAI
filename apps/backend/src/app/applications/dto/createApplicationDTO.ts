import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDTO {
  @IsInt()
  @Type(() => Number)
  jobId!: number;

  @IsInt()
  @Type(() => Number)
  resumeId!: number;
}
