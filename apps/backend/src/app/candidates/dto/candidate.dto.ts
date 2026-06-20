import { QueryEducationDto } from './education.dto';
import { QueryCertificateDto } from './certificate.dto';
import { QueryExperienceDto } from './experience.dto';
import { QueryResumeDto } from './resume.dto';
import { QueryAboutDto } from './about.dto';
import { QuerySkillDto } from './skill.dto';
import { QueryContactDto } from './contact.dto';
import { QuerySocialDto } from './social.dto';

export class CandidateQueryResponseDto {
  id!: string;

  name!: string;

  email!: string;

  firstName?: string;

  lastName?: string;

  phoneNumber?: string;

  dateOfBirth?: Date;

  gender?: string;

  verified!: boolean;

  avatarUrl!: string;

  role!: string;

  banned!: boolean;

  banReason!: string;

  banExpires?: Date;

  educations?: QueryEducationDto[];

  certificates?: QueryCertificateDto[];

  experiences?: QueryExperienceDto[];

  resumes?: QueryResumeDto[];

  about?: QueryAboutDto;

  skills?: QuerySkillDto[];

  contacts?: QueryContactDto[];

  socials?: QuerySocialDto[];

  openForOpportunities?: boolean;

  createdAt!: Date;
}
