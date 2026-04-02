import { Expose, Type } from 'class-transformer';
import { QueryEducationDto } from './education.dto';
import { QueryCertificateDto } from './certificate.dto';
import { QueryExperienceDto } from './experience.dto';
import { QueryResumeDto } from './resume.dto';

export class CandidateQueryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  verified!: boolean;

  @Expose()
  avatarUrl!: string;

  @Expose()
  role!: string;

  @Expose()
  banned!: boolean;

  @Expose()
  banReason!: string;

  @Expose()
  banExpires?: Date;

  @Expose()
  @Type(() => QueryEducationDto)
  educations?: QueryEducationDto[];

  @Expose()
  @Type(() => QueryCertificateDto)
  certificates?: QueryCertificateDto[];

  @Expose()
  @Type(() => QueryExperienceDto)
  experiences?: QueryExperienceDto[];

  @Expose()
  @Type(() => QueryResumeDto)
  resumes?: QueryResumeDto[];

  @Expose()
  @Type(() => Date)
  createdAt!: Date;
}
