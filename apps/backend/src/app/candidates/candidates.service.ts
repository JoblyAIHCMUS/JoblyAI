import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
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

    if (!user) throw new Error(`Candidate with ID ${userId} not found`);
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
  ): Promise<string> {
    const result = await this.prismaClient.education.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result)
      throw new Error(
        `Failed to create education record for candidate with ID ${userId}.`
      );

    return 'Created education with ID ' + result.id;
  }

  async updateEducation(
    userId: string,
    updateDto: Prisma.EducationUpdateInput & { id: number }
  ): Promise<string> {
    const result = await this.prismaClient.education.updateMany({
      where: {
        id: updateDto.id,
        candidateId: userId, // Security: Preventing ID spoofing
      },
      data: updateDto,
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `Education record ${updateDto.id} not found or access denied.`
      );
    }
    return 'Updated education with ID ' + updateDto.id;
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
  ): Promise<string> {
    const result = await this.prismaClient.experience.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result)
      throw new Error(
        `Failed to create experience record for candidate with ID ${userId}.`
      );

    return 'Created experience with ID ' + result.id;
  }

  async updateExperience(
    userId: string,
    updateDto: Prisma.ExperienceUpdateInput & { id: number }
  ): Promise<string> {
    const result = await this.prismaClient.experience.updateMany({
      where: {
        id: updateDto.id,
        candidateId: userId, // Security: Preventing ID spoofing
      },
      data: updateDto,
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `Experience record ${updateDto.id} not found or access denied.`
      );
    }
    return 'Updated experience with ID ' + updateDto.id;
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
  ): Promise<string> {
    const result = await this.prismaClient.resume.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result)
      throw new Error(
        `Failed to create resume record for candidate with ID ${userId}.`
      );

    return 'Created resume with ID ' + result.id;
  }

  async updateResume(
    userId: string,
    updateDto: Prisma.ResumeUpdateInput & { id: number }
  ): Promise<string> {
    const result = await this.prismaClient.resume.updateMany({
      where: {
        id: updateDto.id,
        candidateId: userId, // Security: Preventing ID spoofing
      },
      data: updateDto,
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `Resume record ${updateDto.id} not found or access denied.`
      );
    }
    return 'Updated resume with ID ' + updateDto.id;
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
  ): Promise<string> {
    const result = await this.prismaClient.certificate.updateMany({
      where: {
        id: updateDto.id,
        candidateId: userId, // Security: Preventing ID spoofing
      },
      data: updateDto,
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `Certificate record ${updateDto.id} not found or access denied.`
      );
    }
    return 'Updated certificate with ID ' + updateDto.id;
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
  ): Promise<string> {
    const result = await this.prismaClient.certificate.create({
      data: {
        ...createDto,
        candidate: {
          connect: { id: userId },
        },
      },
    });

    if (!result)
      throw new Error(
        `Failed to create certificate record for candidate with ID ${userId}.`
      );

    return 'Created certificate with ID ' + result.id;
  }
}
