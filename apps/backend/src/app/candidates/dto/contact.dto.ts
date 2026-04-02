import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryContactDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateContactDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateContactDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
