import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  type Certificate,
  type Education,
  type Experience,
  Prisma,
  PrismaClient,
  type Resume,
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
    const result = await this.prismaClient.education.delete({
      where: {
        id: educationId,
        candidateId: userId,
      },
    });
    if (!result)
      throw new NotFoundException(
        `Education record ${educationId} not found or access denied.`
      );
    return 'Deleted education with ID ' + educationId;
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
    const result = await this.prismaClient.experience.delete({
      where: {
        id: experienceId,
        candidateId: userId,
      },
    });
    if (!result)
      throw new NotFoundException(
        `Experience record ${experienceId} not found or access denied.`
      );
    return 'Deleted experience with ID ' + experienceId;
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
    const result = await this.prismaClient.resume.delete({
      where: {
        id: resumeId,
        candidateId: userId,
      },
    });
    if (!result)
      throw new NotFoundException(
        `Resume record ${resumeId} not found or access denied.`
      );
    return 'Deleted resume with ID ' + resumeId;
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
    const result = await this.prismaClient.certificate.delete({
      where: {
        id: certificateId,
        candidateId: userId,
      },
    });
    if (!result)
      throw new NotFoundException(
        `Certificate record ${certificateId} not found or access denied.`
      );
    return 'Deleted certificate with ID ' + certificateId;
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
}
