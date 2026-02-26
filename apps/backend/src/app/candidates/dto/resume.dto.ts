import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class QueryResumeDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  fileUrl!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  fileUrl!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateResumeDto {
  @IsString()
  id!: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
