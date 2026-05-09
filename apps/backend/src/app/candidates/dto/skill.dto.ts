import { CandidateSkillLevel } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class QuerySkillDto {
  @IsInt()
  id!: number;

  @IsInt()
  skillId!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsEnum(CandidateSkillLevel)
  level?: CandidateSkillLevel;

  @IsOptional()
  @IsInt()
  years?: number;

  @IsOptional()
  @IsInt({ each: true })
  sourceCvIds?: number[];
}

export class CreateSkillDto {
  @ValidateIf((o: CreateSkillDto) => o.skillId === undefined)
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ValidateIf((o: CreateSkillDto) => o.title === undefined)
  @IsInt()
  skillId?: number;

  @IsOptional()
  @IsEnum(CandidateSkillLevel)
  level?: CandidateSkillLevel;

  @IsOptional()
  @IsInt()
  years?: number;
}

export class UpdateSkillDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsInt()
  skillId?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(CandidateSkillLevel)
  level?: CandidateSkillLevel;

  @IsOptional()
  @IsInt()
  years?: number;
}
