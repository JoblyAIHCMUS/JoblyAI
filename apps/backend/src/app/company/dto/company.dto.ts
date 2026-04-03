import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CompanyCreateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  sizeRange?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;
}

export class CompanyUpdateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  sizeRange?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;
}

export class CompanyPatchDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  sizeRange?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;
}

export class CompanyAddEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employerId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  role?: string;
}

export class CompanyGrantAdminDto {
  @IsString()
  @IsNotEmpty()
  employerId!: string;
}

export class CompanyDeleteDto {
  @IsInt()
  @Min(1)
  id!: number;
}
