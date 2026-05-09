import { CandidateSocialPlatform } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class QuerySocialDto {
  @Expose()
  @IsNotEmpty()
  id!: number;

  @Expose()
  @IsEnum(CandidateSocialPlatform)
  platform!: CandidateSocialPlatform;

  @Expose()
  @IsString()
  @IsNotEmpty()
  url!: string;

  @Expose()
  @IsOptional()
  @IsString()
  username?: string;

  @Expose()
  @IsOptional()
  @IsInt({ each: true })
  sourceCvIds?: number[];
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
