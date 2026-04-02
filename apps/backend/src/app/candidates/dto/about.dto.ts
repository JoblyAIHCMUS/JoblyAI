import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryAboutDto {
  @IsString()
  id!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class CreateAboutDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateAboutDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
