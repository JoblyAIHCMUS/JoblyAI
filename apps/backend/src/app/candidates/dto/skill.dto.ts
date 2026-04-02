import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QuerySkillDto {
  @IsInt()
  id!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsInt()
  years?: number;
}

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsInt()
  years?: number;
}

export class UpdateSkillDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsInt()
  years?: number;
}
