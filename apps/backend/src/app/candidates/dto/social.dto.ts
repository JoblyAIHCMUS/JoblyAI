import { CandidateSocialPlatform } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class QuerySocialDto {
  @IsNotEmpty()
  id!: number;

  @IsEnum(CandidateSocialPlatform)
  platform!: CandidateSocialPlatform;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class CreateSocialDto {
  @IsEnum(CandidateSocialPlatform)
  platform!: CandidateSocialPlatform;

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
  @IsEnum(CandidateSocialPlatform)
  platform?: CandidateSocialPlatform;

  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
