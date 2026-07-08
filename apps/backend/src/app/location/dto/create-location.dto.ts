import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'geoapify' })
  @IsString()
  provider!: string;

  @ApiProperty({ example: 'place_id_123' })
  @IsString()
  providerId!: string;

  @ApiProperty({ example: 'Paris, France' })
  @IsString()
  formattedAddress!: string;

  @ApiProperty({ example: 48.856614 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 2.3522219 })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Île-de-France' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'France' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '75001' })
  @IsString()
  @IsOptional()
  postcode?: string;
}
