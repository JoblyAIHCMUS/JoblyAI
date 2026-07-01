import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RequirementInputLite {
  @IsString()
  skillName!: string;

  @IsString()
  importance!: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';

  @IsOptional()
  minYearsExperience?: number | null;
}

export class GenerateQuestionsRequestDTO {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequirementInputLite)
  requirements?: RequirementInputLite[];
}
