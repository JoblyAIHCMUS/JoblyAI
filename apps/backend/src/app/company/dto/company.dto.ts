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
  email!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  role?: string;
}

export class CompanyGrantAdminDto {
  @IsString()
  @IsNotEmpty()
  email!: string;
}

export class CompanyDeleteDto {
  @IsInt()
  @Min(1)
  id!: number;
}

export class CompanyLogoDto {
  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  fileUrl!: string;
}
