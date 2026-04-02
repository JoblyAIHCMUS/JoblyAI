import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class QuerySocialDto {
  @IsNotEmpty()
  id!: number;

  @IsString()
  @IsNotEmpty()
  platform!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class CreateSocialDto {
  @IsString()
  @IsNotEmpty()
  platform!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class UpdateSocialDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
