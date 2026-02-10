import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchJobsDTO {
    @IsOptional()
    @Type(() => Number)
    @IsInt() @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt() @Min(1) @Max(100)
    pageSize = 10;

    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsEnum(['full-time', 'part-time', 'contract', 'internship'])
    type?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @Type(() => Boolean)
    remote?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Type(() => String)
    skills?: string[];
}