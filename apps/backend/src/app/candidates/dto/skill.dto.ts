import { CandidateSkillLevel } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class QuerySkillDto {
  @Expose()
  @IsInt()
  id!: number;

  @Expose()
  @IsInt()
  skillId!: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Expose()
  @IsOptional()
  @IsEnum(CandidateSkillLevel)
  level?: CandidateSkillLevel;

  @Expose()
  @IsOptional()
  @IsInt()
  years?: number;

  @Expose()
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
