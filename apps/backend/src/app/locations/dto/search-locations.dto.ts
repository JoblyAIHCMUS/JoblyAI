import { IsString, IsOptional } from 'class-validator';

export class SearchLocationsDto {
  @IsString()
  @IsOptional()
  q!: string;
}
