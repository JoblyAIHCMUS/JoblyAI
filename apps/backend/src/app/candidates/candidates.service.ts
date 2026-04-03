import {
  BadRequestException,
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
import { S3Service } from '../s3/s3.service';
import { CandidateQueryResponseDto } from './dto/candidate.dto';
import { UpdateCertificateDto } from './dto/certificate.dto';
import { UpdateAvatarDto } from './dto/avatar.dto';
import { UpdateEducationDto } from './dto/education.dto';
import { UpdateExperienceDto } from './dto/experience.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectPrisma() private readonly prismaClient: PrismaClient,
    private readonly s3Service: S3Service
  ) {}

  private toPrismaDateTime(value: string | Date, fieldName: string): Date {
    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(
        `${fieldName} must be a valid ISO-8601 datetime`
      );
    }

    return parsedDate;
  }

  private toPrismaNullableDateTime(
    value: string | Date | null,
    fieldName: string
  ): Date | null {
    if (value === null) {
      return null;
    }

    return this.toPrismaDateTime(value, fieldName);
  }

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
      phoneNumber: user.phoneNumber ?? '',
      dateOfBirth: user.dateOfBirth ?? undefined,
      gender: user.gender ?? '',
      verified: user.emailVerified,
      banned: user.banned ?? false,
      banReason: user.banReason ?? '',
      banExpires: user.banExpires ?? undefined,
      avatarUrl: user.avatarUrl || '',
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
        fileKey: resume.fileKey ?? '',
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
    updateDto: UpdateEducationDto
  ): Promise<Education> {
    const { id, startDate, endDate, ...rest } = updateDto;

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

    const data: Prisma.EducationUpdateInput = {
      ...rest,
      ...(startDate === undefined
        ? {}
        : { startDate: this.toPrismaDateTime(startDate, 'startDate') }),
      ...(endDate === undefined
        ? {}
        : {
            endDate: this.toPrismaNullableDateTime(endDate, 'endDate'),
          }),
    };

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
    updateDto: UpdateExperienceDto
  ): Promise<Experience> {
    const { id, startDate, endDate, ...rest } = updateDto;

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

    const data: Prisma.ExperienceUpdateInput = {
      ...rest,
      ...(startDate === undefined
        ? {}
        : { startDate: this.toPrismaDateTime(startDate, 'startDate') }),
      ...(endDate === undefined
        ? {}
        : {
            endDate: this.toPrismaNullableDateTime(endDate, 'endDate'),
          }),
    };

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
    // First, get the resume to get the fileKey for S3 deletion
    const resume = await this.prismaClient.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: userId,
      },
    });

    if (!resume) {
      throw new NotFoundException(
        `Resume record ${resumeId} not found or access denied.`
      );
    }

    // Delete from S3 if fileKey exists
    if (resume.fileKey) {
      try {
        // Defensive: ensure fileKey is a string (Prisma might return it as-is from DB)
        const fileKeyToDelete = String(resume.fileKey).trim();
        if (fileKeyToDelete) {
          await this.s3Service.deleteFile(fileKeyToDelete);
        }
      } catch (error) {
        console.error(
          `Failed to delete S3 file, continuing with DB deletion:`,
          error
        );
        // Continue with DB deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await this.prismaClient.resume.delete({
      where: {
        id: resumeId,
        candidateId: userId,
      },
    });

    return `Deleted resume with ID ${resumeId} and file from S3`;
  }

  // Certificate
  async updateCertificate(
    userId: string,
    updateDto: UpdateCertificateDto
  ): Promise<Certificate> {
    const { id, issueDate, expirationDate, ...rest } = updateDto;

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

    const data: Prisma.CertificateUpdateInput = {
      ...rest,
      ...(issueDate === undefined
        ? {}
        : { issueDate: this.toPrismaDateTime(issueDate, 'issueDate') }),
      ...(expirationDate === undefined
        ? {}
        : {
            expiryDate: this.toPrismaNullableDateTime(
              expirationDate,
              'expirationDate'
            ),
          }),
    };

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
      throw new NotFoundException(
        `Skill ${skillId} not found or access denied.`
      );
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
      throw new NotFoundException(
        `Contact ${contactId} not found or access denied.`
      );
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
      throw new NotFoundException(
        `Social ${socialId} not found or access denied.`
      );
    }

    await this.prismaClient.candidateSocial.delete({
      where: { id: socialId },
    });

    return `Deleted social with ID ${socialId}`;
  }

  /**
   * UPDATE USER AVATAR
   *
   * Flow:
   * 1. Get current user avatar fileKey from DB
   * 2. Update DB with new fileKey and fileUrl
   * 3. Delete old avatar from S3 (if exists)
   * 4. Return updated user with new avatarUrl
   *
   * Notes:
   * - Avatar is PUBLIC (no presigned URL needed for viewing)
   * - Old avatar is deleted from S3 to avoid storage waste
   * - Uses fileKey to delete old avatar (extracted from fileUrl if needed)
   */
  async updateAvatar(
    userId: string,
    updateDto: UpdateAvatarDto
  ): Promise<{ id: string; email: string; avatarUrl: string | null }> {
    // Get current user with their existing avatar info
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update DB with new avatar URL
    const updatedUser = await this.prismaClient.user.update({
      where: { id: userId },
      data: {
        avatarUrl: updateDto.fileUrl,
      },
      select: { id: true, email: true, avatarUrl: true },
    });

    // Delete old avatar from S3 if it exists
    if (user.avatarUrl) {
      try {
        // Extract fileKey from avatarUrl (e.g., "assets/avatars/uuid.jpg" from full URL)
        const urlParts = user.avatarUrl.split('/');
        const oldFileKey = urlParts.slice(-2).join('/'); // Get last 2 parts: "avatars/uuid.jpg"

        if (oldFileKey && oldFileKey.startsWith('avatars/')) {
          await this.s3Service.deleteFile(`assets/${oldFileKey}`);
        }
      } catch (error) {
        // Log the error but don't fail the operation
        console.error(
          `Warning: Failed to delete old avatar from S3. New avatar has been saved to DB.`,
          error
        );
        // Continue - user's new avatar is already saved in DB
      }
    }

    return updatedUser;
  }
}
