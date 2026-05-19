import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCertificateDto {
  @IsNumber()
  id!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  issuer!: string;

  @IsDateString()
  issueDate!: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string; // Optional: Some certs don't expire

  @IsOptional()
  @IsString()
  credentialId?: string; // e.g., "AWS-12345678"

  @IsOptional()
  @IsUrl()
  url?: string; // Link to the digital badge or verification page

  @IsOptional()
  @IsInt({ each: true })
  sourceCvIds?: number[];
}
export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  issuer!: string;

  @IsDateString()
  issueDate!: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: any }) => (value === '' ? null : value))
  expiryDate?: string; // Optional: Some certs don't expire

  @IsOptional()
  @IsString()
  credentialId?: string; // e.g., "AWS-12345678"

  @IsOptional()
  @IsUrl()
  url?: string; // Link to the digital badge or verification page
}

export class UpdateCertificateDto {
  @IsNumber()
  id!: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: any }) => (value === '' ? undefined : value))
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: any }) => (value === '' ? null : value))
  expiryDate?: string;

  @IsOptional()
  @IsString()
  credentialId?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
