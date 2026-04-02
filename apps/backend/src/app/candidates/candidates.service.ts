import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  type Certificate,
  type CandidateContact,
  type CandidateDescription,
  type CandidateSocial,
  type Education,
  type Experience,
  type Resume,
  type CandidateSkill,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import { CandidateQueryResponseDto } from './dto/candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(@InjectPrisma() private readonly prismaClient: PrismaClient) {}

  async getProfileDetails(userId: string): Promise<CandidateQueryResponseDto> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        education: true,
        experiences: true,    
        certificates: true,
        resumes: true,
        candidateDescription: true,
        candidateSkills: true,
        candidateContacts: true,
        candidateSocials: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Candidate with ID ${userId} not found`);
    }
    return {
      id: user.id || '',
      name: user.name || '',
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      verified: user.emailVerified,
      banned: user.banned ?? false,
      banReason: user.banReason ?? '',
      banExpires: user.banExpires ?? undefined,
      image: user.image || '',
      role: user.role || 'candidate',
      createdAt: user.createdAt,
      educations: user.education.map((edu) => ({
        ...edu,
        grade: edu.grade || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        degree: edu.degree || '',
        description: edu.description || '',
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate?.toISOString(),
      })),
      experiences: user.experiences.map((exp) => ({
        ...exp,
        companyName: exp.companyName ?? '',
        jobTitle: exp.jobTitle ?? '',
        location: exp.location ?? '',
        description: exp.description ?? '',
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate?.toISOString(),
      })),
      certificates: user.certificates.map((cert) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate.toISOString(),
        expiryDate: cert.expiryDate?.toISOString() ?? undefined,
        credentialId: cert.credentialId ?? undefined,
        url: cert.url ?? undefined,
      })),
      resumes: user.resumes.map((resume) => ({
        id: resume.id,
        isDefault: resume.isDefault,
        fileName: resume.fileName ?? '',
        fileUrl: resume.fileUrl ?? '',
        fileType: resume.fileType ?? 'pdf',
        fileSize: resume.fileSize ?? undefined,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
      })),
      about: user.candidateDescription
        ? {
            id: user.candidateDescription.id,
            title: user.candidateDescription.title ?? '',
            bio: user.candidateDescription.bio ?? '',
          }
        : undefined,
      skills: user.candidateSkills.map((skill) => ({
        id: skill.id,
        title: skill.title,
        level: skill.level ?? undefined,
        years: skill.years ?? undefined,
      })),
      contacts: user.candidateContacts.map((contact) => ({
        id: contact.id,
        type: contact.type ?? undefined,
        value: contact.value,
        isPrimary: contact.isPrimary ?? false,
      })),
      socials: user.candidateSocials.map((social) => ({
        id: social.id,
        platform: social.platform,
        url: social.url,
        username: social.username ?? undefined,
      })),
    };
  }

  async createEducation(
    userId: string,
    createDto: Omit<Prisma.EducationCreateInput, 'candidate'>
  ): Promise<Education> {
    const result = await this.prismaClient.education.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result) {
      throw new InternalServerErrorException(
        `Failed to create education record for candidate with ID ${userId}.`
      );
    }
    return result;
  }

  async updateEducation(
    userId: string,
    updateDto: Prisma.EducationUpdateInput & { id: number }
  ): Promise<Education> {
    const { id, ...data } = updateDto;

    const existing = await this.prismaClient.education.findFirst({
      where: {
        id,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Education record ${id} not found or access denied.`
      );
    }

    return this.prismaClient.education.update({
      where: { id },
      data,
    });
  }

  async deleteEducation(userId: string, educationId: number): Promise<string> {
    const existing = await this.prismaClient.education.findFirst({
      where: {
        id: educationId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Education record ${educationId} not found or access denied.`
      );
    }

    await this.prismaClient.education.delete({
      where: {
        id: educationId,
      },
    });

    return `Deleted education with ID ${educationId}`;
  }

  // Experience
  async createExperience(
    userId: string,
    createDto: Omit<Prisma.ExperienceCreateInput, 'candidate'>
  ): Promise<Experience> {
    const result = await this.prismaClient.experience.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result)
      throw new InternalServerErrorException(
        `Failed to create experience record for candidate with ID ${userId}.`
      );

    return result;
  }

  async updateExperience(
    userId: string,
    updateDto: Prisma.ExperienceUpdateInput & { id: number }
  ): Promise<Experience> {
    const { id, ...data } = updateDto;

    const existing = await this.prismaClient.experience.findFirst({
      where: {
        id,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Experience record ${id} not found or access denied.`
      );
    }

    return this.prismaClient.experience.update({
      where: { id },
      data,
    });
  }

  async deleteExperience(
    userId: string,
    experienceId: number
  ): Promise<string> {
    const existing = await this.prismaClient.experience.findFirst({
      where: {
        id: experienceId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Experience record ${experienceId} not found or access denied.`
      );
    }

    await this.prismaClient.experience.delete({
      where: {
        id: experienceId,
      },
    });

    return `Deleted experience with ID ${experienceId}`;
  }

  // Resume
  async createResume(
    userId: string,
    createDto: Omit<Prisma.ResumeCreateInput, 'candidate'>
  ): Promise<Resume> {
    const result = await this.prismaClient.resume.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result)
      throw new InternalServerErrorException(
        `Failed to create resume record for candidate with ID ${userId}.`
      );

    return result;
  }

  async updateResume(
    userId: string,
    updateDto: Prisma.ResumeUpdateInput & { id: number }
  ): Promise<Resume> {
    const { id, ...data } = updateDto;

    const existing = await this.prismaClient.resume.findFirst({
      where: {
        id,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Resume record ${id} not found or access denied.`
      );
    }

    return this.prismaClient.resume.update({
      where: { id },
      data,
    });
  }

  async deleteResume(userId: string, resumeId: number): Promise<string> {
    const existing = await this.prismaClient.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Resume record ${resumeId} not found or access denied.`
      );
    }

    await this.prismaClient.resume.delete({
      where: {
        id: resumeId,
      },
    });

    return `Deleted resume with ID ${resumeId}`;
  }

  // Certificate
  async updateCertificate(
    userId: string,
    updateDto: Prisma.CertificateUpdateInput & { id: number }
  ): Promise<Certificate> {
    const { id, ...data } = updateDto;

    const existing = await this.prismaClient.certificate.findFirst({
      where: {
        id,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Certificate record ${id} not found or access denied.`
      );
    }

    return this.prismaClient.certificate.update({
      where: { id },
      data,
    });
  }

  async deleteCertificate(
    userId: string,
    certificateId: number
  ): Promise<string> {
    const existing = await this.prismaClient.certificate.findFirst({
      where: {
        id: certificateId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Certificate record ${certificateId} not found or access denied.`
      );
    }

    await this.prismaClient.certificate.delete({
      where: {
        id: certificateId,
      },
    });

    return `Deleted certificate with ID ${certificateId}`;
  }

  async createCertificateDetail(
    userId: string,
    createDto: Omit<Prisma.CertificateCreateInput, 'candidate'>
  ): Promise<Certificate> {
    const result = await this.prismaClient.certificate.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result)
      throw new InternalServerErrorException(
        `Failed to create certificate record for candidate with ID ${userId}.`
      );

    return result;
  }

  // About
  async getAbout(userId: string): Promise<CandidateDescription | null> {
    return this.prismaClient.candidateDescription.findUnique({
      where: { candidateId: userId },
    });
  }

  async createAbout(
    userId: string,
    createDto: Omit<Prisma.CandidateDescriptionCreateInput, 'candidate'>
  ): Promise<CandidateDescription> {
    const existing = await this.prismaClient.candidateDescription.findUnique({
      where: { candidateId: userId },
    });

    if (existing) {
      throw new InternalServerErrorException(
        `Candidate description already exists for user ${userId}`
      );
    }

    return this.prismaClient.candidateDescription.create({
      data: {
        ...createDto,
        candidate: { connect: { id: userId } },
      },
    });
  }

  async updateAbout(
    userId: string,
    updateDto: Prisma.CandidateDescriptionUpdateInput & { id: number }
  ): Promise<CandidateDescription> {
    const { id, ...data } = updateDto;

    const existing = await this.prismaClient.candidateDescription.findFirst({
      where: { id, candidateId: userId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Candidate description ${id} not found or access denied.`
      );
    }

    return this.prismaClient.candidateDescription.update({
      where: { id },
      data,
    });
  }

  async deleteAbout(userId: string, aboutId: number): Promise<string> {
    const existing = await this.prismaClient.candidateDescription.findFirst({
      where: {
        id: aboutId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Candidate description ${aboutId} not found or access denied.`
      );
    }

    await this.prismaClient.candidateDescription.delete({
      where: { id: aboutId },
    });

    return `Deleted about with ID ${aboutId}`;
  }

  // Skill
  async createSkill(
    userId: string,
    createDto: Omit<Prisma.CandidateSkillCreateInput, 'candidate'>
  ): Promise<CandidateSkill> {
    return this.prismaClient.candidateSkill.create({
      data: {
        ...createDto,
        candidate: { connect: { id: userId } },
      },
    });
  }

  async updateSkill(
    userId: string,
    updateDto: Prisma.CandidateSkillUpdateInput & { id: number }
  ): Promise<CandidateSkill> {
    const { id, ...data } = updateDto;
    const existing = await this.prismaClient.candidateSkill.findFirst({
      where: { id, candidateId: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Skill ${id} not found or access denied.`);
    }

    return this.prismaClient.candidateSkill.update({
      where: { id },
      data,
    });
  }

  async deleteSkill(userId: string, skillId: number): Promise<string> {
    const existing = await this.prismaClient.candidateSkill.findFirst({
      where: {
        id: skillId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Skill ${skillId} not found or access denied.`);
    }

    await this.prismaClient.candidateSkill.delete({
      where: { id: skillId },
    });

    return `Deleted skill with ID ${skillId}`;
  }

  // Contact
  async createContact(
    userId: string,
    createDto: Omit<Prisma.CandidateContactCreateInput, 'candidate'>
  ): Promise<CandidateContact> {
    return this.prismaClient.candidateContact.create({
      data: {
        ...createDto,
        candidate: { connect: { id: userId } },
      },
    });
  }

  async updateContact(
    userId: string,
    updateDto: Prisma.CandidateContactUpdateInput & { id: number }
  ): Promise<CandidateContact> {
    const { id, ...data } = updateDto;
    const existing = await this.prismaClient.candidateContact.findFirst({
      where: { id, candidateId: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Contact ${id} not found or access denied.`);
    }

    return this.prismaClient.candidateContact.update({
      where: { id },
      data,
    });
  }

  async deleteContact(userId: string, contactId: number): Promise<string> {
    const existing = await this.prismaClient.candidateContact.findFirst({
      where: {
        id: contactId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Contact ${contactId} not found or access denied.`);
    }

    await this.prismaClient.candidateContact.delete({
      where: { id: contactId },
    });

    return `Deleted contact with ID ${contactId}`;
  }

  // Socials
  async createSocial(
    userId: string,
    createDto: Omit<Prisma.CandidateSocialCreateInput, 'candidate'>
  ): Promise<CandidateSocial> {
    return this.prismaClient.candidateSocial.create({
      data: {
        ...createDto,
        candidate: { connect: { id: userId } },
      },
    });
  }

  async updateSocial(
    userId: string,
    updateDto: Prisma.CandidateSocialUpdateInput & { id: number }
  ): Promise<CandidateSocial> {
    const { id, ...data } = updateDto;
    const existing = await this.prismaClient.candidateSocial.findFirst({
      where: { id, candidateId: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Social ${id} not found or access denied.`);
    }

    return this.prismaClient.candidateSocial.update({
      where: { id },
      data,
    });
  }

  async deleteSocial(userId: string, socialId: number): Promise<string> {
    const existing = await this.prismaClient.candidateSocial.findFirst({
      where: {
        id: socialId,
        candidateId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Social ${socialId} not found or access denied.`);
    }

    await this.prismaClient.candidateSocial.delete({
      where: { id: socialId },
    });

    return `Deleted social with ID ${socialId}`;
  }
}

