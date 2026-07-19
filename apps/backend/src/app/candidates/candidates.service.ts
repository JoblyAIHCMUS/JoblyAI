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
import { GcsService } from '../gcs/gcs.service';
import { CandidateQueryResponseDto } from './dto/candidate.dto';
import { UpdateCertificateDto } from './dto/certificate.dto';
import { UpdateAvatarDto } from './dto/avatar.dto';
import { UpdateEducationDto } from './dto/education.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LocationService } from '../location/location.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectPrisma() private readonly prismaClient: PrismaClient,
    private readonly gcsService: GcsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly locationService: LocationService
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

    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }

    return this.toPrismaDateTime(value, fieldName);
  }

  private normalizeSkillName(skillName: string): string {
    return skillName.trim().replace(/\s+/g, ' ');
  }

  private async findSkillIdByNameInsensitive(
    normalizedSkillName: string
  ): Promise<number | null> {
    const existingSkill = await this.prismaClient.skill.findFirst({
      where: {
        name: {
          equals: normalizedSkillName,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    return existingSkill?.id ?? null;
  }

  private async findOrCreateSkillIdByTitle(title: string): Promise<number> {
    const normalizedSkillName = this.normalizeSkillName(title);
    const existingSkillId = await this.findSkillIdByNameInsensitive(
      normalizedSkillName
    );

    if (existingSkillId !== null) {
      return existingSkillId;
    }

    try {
      const createdSkill = await this.prismaClient.skill.create({
        data: { name: normalizedSkillName },
        select: { id: true },
      });

      return createdSkill.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const resolvedSkillId = await this.findSkillIdByNameInsensitive(
          normalizedSkillName
        );

        if (resolvedSkillId !== null) {
          return resolvedSkillId;
        }
      }

      throw error;
    }
  }

  private async resolveSkillIdFromInput(input: {
    skillId?: number;
    title?: string;
  }): Promise<number> {
    if (input.skillId !== undefined && input.title !== undefined) {
      throw new BadRequestException(
        'Provide either skillId or title, not both.'
      );
    }

    if (input.skillId !== undefined) {
      const skillById = await this.prismaClient.skill.findUnique({
        where: { id: input.skillId },
        select: { id: true },
      });

      if (!skillById) {
        throw new BadRequestException(`Skill ${input.skillId} does not exist.`);
      }

      return skillById.id;
    }

    if (input.title && input.title.trim()) {
      return this.findOrCreateSkillIdByTitle(input.title);
    }

    throw new BadRequestException('Either skillId or title is required.');
  }

  async updateProfile(
    userId: string,
    data: { phoneNumber?: string; openForOpportunities?: boolean }
  ) {
    const updated = await this.prismaClient.user.update({
      where: { id: userId },
      data,
    });
    return {
      success: true,
      openForOpportunities: updated.openForOpportunities,
    };
  }

  async getProfileDetails(userId: string): Promise<CandidateQueryResponseDto> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        education: true,
        experiences: {
          include: {
            location: true,
          },
        },
        certificates: true,
        resumes: true,
        candidateDescription: true,
        candidateSkills: {
          include: {
            skill: true,
          },
        },
        candidateContacts: true,
        candidateSocials: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Candidate with ID ${userId} not found`);
    }

    // Compute name from firstName + lastName, fallback to user.name
    const computedName =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.name ||
      '';

    return {
      id: user.id || '',
      name: computedName,
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
        id: edu.id,
        school: edu.school,
        degree: edu.degree ?? 'OTHER',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate?.toISOString(),
        grade: edu.grade || '',
        description: edu.description || '',
        sourceCvIds: edu.sourceCvIds || [],
      })),
      experiences: user.experiences.map((exp) => ({
        id: exp.id,
        companyName: exp.companyName,
        jobTitle: exp.jobTitle,
        location: exp.location?.formattedAddress || '',
        locationDetail: exp.location
          ? {
              id: exp.location.id,
              provider: exp.location.provider,
              providerId: exp.location.providerId,
              formattedAddress: exp.location.formattedAddress,
              lat: exp.location.lat,
              lng: exp.location.lng,
              city: exp.location.city || null,
              state: exp.location.state || null,
              country: exp.location.country || null,
              postcode: exp.location.postcode || null,
            }
          : null,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate?.toISOString(),
        description: exp.description || '',
        type: exp.type ?? undefined,
        sourceCvIds: exp.sourceCvIds || [],
      })),
      certificates: user.certificates.map((cert) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate.toISOString(),
        expiryDate: cert.expiryDate?.toISOString() ?? undefined,
        credentialId: cert.credentialId ?? undefined,
        url: cert.url ?? undefined,
        sourceCvIds: cert.sourceCvIds || [],
      })),
      resumes: await Promise.all(
        [...user.resumes]
          .sort(
            (first, second) =>
              second.updatedAt.getTime() - first.updatedAt.getTime()
          )
          .map(async (resume) => ({
            id: resume.id,
            isDefault: resume.isDefault,
            fileName: resume.fileName ?? '',
            fileKey: resume.fileKey ?? '',
            fileType: resume.fileType ?? 'pdf',
            fileSize: resume.fileSize ?? undefined,
            fileUrl: resume.fileKey
              ? (
                  await this.gcsService.generatePresignedDownloadUrl(
                    resume.fileKey
                  )
                ).downloadUrl
              : '',
            aiScore: resume.aiScore,
            aiFeedback: resume.aiFeedback,
            parsedText: resume.parsedText,
            isSyncedToProfile: resume.isSyncedToProfile,
            createdAt: resume.createdAt.toISOString(),
            updatedAt: resume.updatedAt.toISOString(),
          }))
      ),
      about: user.candidateDescription
        ? {
            id: user.candidateDescription.id,
            title: user.candidateDescription.title ?? '',
            bio: user.candidateDescription.bio ?? '',
          }
        : undefined,
      skills: user.candidateSkills.map((skill) => ({
        id: skill.id,
        skillId: skill.skillId,
        title: skill.skill.name,
        level: skill.level ?? undefined,
        years: skill.years ?? undefined,
        sourceCvIds: skill.sourceCvIds || [],
      })),
      contacts: user.candidateContacts.map((contact) => ({
        id: contact.id,
        type: contact.type ?? undefined,
        value: contact.value,
        isPrimary: contact.isPrimary ?? false,
        sourceCvIds: contact.sourceCvIds || [],
      })),
      socials: user.candidateSocials.map((social) => ({
        id: social.id,
        platform: social.platform,
        url: social.url,
        username: social.username ?? undefined,
        sourceCvIds: social.sourceCvIds || [],
      })),
      openForOpportunities: user.openForOpportunities,
    };
  }

  async createEducation(
    userId: string,
    createDto: Omit<Prisma.EducationCreateInput, 'candidate'>
  ): Promise<Education> {
    const { startDate, endDate, ...rest } = createDto;

    const result = await this.prismaClient.education.create({
      data: {
        ...rest,
        startDate: this.toPrismaDateTime(startDate, 'startDate'),
        ...(endDate === undefined
          ? {}
          : {
              endDate: this.toPrismaNullableDateTime(endDate, 'endDate'),
            }),
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
      sourceCvIds: [], // Manual edit clears AI source tracking
      ...(startDate === undefined
        ? {}
        : { startDate: this.toPrismaDateTime(startDate, 'startDate') }),
      ...(endDate === undefined
        ? {}
        : {
            endDate: this.toPrismaNullableDateTime(endDate, 'endDate'),
          }),
    };

    return this.prismaClient
      .$transaction(async (tx) => {
        const updated = await tx.education.update({
          where: { id },
          data,
        });

        // Clear stale vector embedding
        await tx.$executeRawUnsafe(
          `UPDATE "Education" SET embedding = NULL WHERE id = $1`,
          id
        );

        return updated;
      })
      .then((updated) => {
        this.eventEmitter.emit('profile.item.updated', {
          model: 'Education',
          id: updated.id,
          content: `${updated.school} | ${updated.degree} | ${updated.fieldOfStudy}`,
        });
        return updated;
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
    createDto: CreateExperienceDto
  ): Promise<Experience> {
    const { startDate, endDate, location, locationId, ...rest } = createDto;

    let resolvedLocationId: string | undefined = locationId;
    if (location) {
      const locRecord = await this.locationService.getOrCreateLocation(
        location
      );
      resolvedLocationId = locRecord.id;
    }

    const result = await this.prismaClient.experience.create({
      data: {
        ...rest,
        location: resolvedLocationId
          ? { connect: { id: resolvedLocationId } }
          : undefined,
        startDate: this.toPrismaDateTime(startDate, 'startDate'),
        ...(endDate === undefined
          ? {}
          : {
              endDate: this.toPrismaNullableDateTime(endDate, 'endDate'),
            }),
        candidate: {
          connect: { id: userId },
        },
      },
      include: {
        location: true,
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
    const { id, startDate, endDate, location, locationId, ...rest } = updateDto;

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

    let resolvedLocationId: string | null | undefined = undefined;
    if (locationId !== undefined) {
      resolvedLocationId = locationId;
    }
    if (location !== undefined) {
      if (location === null) {
        resolvedLocationId = null;
      } else {
        const locRecord = await this.locationService.getOrCreateLocation(
          location
        );
        resolvedLocationId = locRecord.id;
      }
    }

    const data: Prisma.ExperienceUpdateInput = {
      ...rest,
      location:
        resolvedLocationId !== undefined
          ? resolvedLocationId
            ? { connect: { id: resolvedLocationId } }
            : { disconnect: true }
          : undefined,
      sourceCvIds: [], // Manual edit clears AI source tracking
      ...(startDate === undefined
        ? {}
        : { startDate: this.toPrismaDateTime(startDate, 'startDate') }),
      ...(endDate === undefined
        ? {}
        : {
            endDate: this.toPrismaNullableDateTime(endDate, 'endDate'),
          }),
    };

    return this.prismaClient
      .$transaction(async (tx) => {
        const updated = await tx.experience.update({
          where: { id },
          data,
          include: {
            location: true,
          },
        });

        // Clear stale vector embedding
        await tx.$executeRawUnsafe(
          `UPDATE "Experience" SET embedding = NULL WHERE id = $1`,
          id
        );

        return updated;
      })
      .then((updated) => {
        this.eventEmitter.emit('profile.item.updated', {
          model: 'Experience',
          id: updated.id,
          content: `${updated.companyName} | ${updated.jobTitle} | ${updated.description}`,
        });
        return updated;
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
    const runCreate = async () =>
      this.prismaClient.$transaction(
        async (tx) => {
          const existingCount = await tx.resume.count({
            where: { candidateId: userId },
          });

          if (existingCount >= 5) {
            throw new BadRequestException('You can store up to 5 resumes.');
          }

          const created = await tx.resume.create({
            data: {
              ...createDto,
              isSyncedToProfile: false, // Ensure new resumes are NOT marked as synced by default
              candidate: {
                connect: { id: userId },
              },
            },
          });

          if (createDto.isDefault) {
            await tx.resume.updateMany({
              where: {
                candidateId: userId,
                id: { not: created.id },
              },
              data: { isDefault: false },
            });
          }

          return created;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

    let result: Resume | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await runCreate();
        break;
      } catch (error: unknown) {
        // P2034: "Transaction failed due to a write conflict or a deadlock. Please retry your transaction"
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < 2
        ) {
          continue;
        }

        throw error;
      }
    }

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

    const wantsDefault =
      data.isDefault === true ||
      (typeof data.isDefault === 'object' &&
        data.isDefault !== null &&
        'set' in data.isDefault &&
        (data.isDefault as { set?: unknown }).set === true);

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

    if (wantsDefault) {
      const [updated] = await this.prismaClient.$transaction([
        this.prismaClient.resume.update({
          where: { id },
          data,
        }),
        this.prismaClient.resume.updateMany({
          where: {
            candidateId: userId,
            id: { not: id },
          },
          data: { isDefault: false },
        }),
      ]);

      return updated;
    }

    return this.prismaClient.resume.update({
      where: { id },
      data,
    });
  }

  async deleteResume(
    userId: string,
    resumeId: number,
    shouldKeepData = false
  ): Promise<string> {
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
        const fileKeyToDelete = String(resume.fileKey).trim();
        if (fileKeyToDelete) {
          await this.gcsService.deleteFile(fileKeyToDelete);
        }
      } catch (error) {
        console.error(
          `Failed to delete GCS file, continuing with DB deletion:`,
          error
        );
      }
    }

    const wasDefault = resume.isDefault;

    // Delete from database and reassign default if needed (atomic)
    await this.prismaClient.$transaction(async (tx) => {
      await tx.resume.delete({
        where: {
          id: resumeId,
          candidateId: userId,
        },
      });

      if (wasDefault) {
        const nextDefault = await tx.resume.findFirst({
          where: { candidateId: userId },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });
        if (nextDefault) {
          await tx.resume.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }
    });

    // Emit event for cleanup (e.g. AI-sync data removal)
    // CRITICAL: Use emitAsync and await to ensure profile data is updated BEFORE returning success to frontend
    await this.eventEmitter.emitAsync('resume.deleted', {
      resumeId,
      candidateId: userId,
      shouldKeepData,
    });

    return 'Resume deleted';
  }

  // Certificate
  async updateCertificate(
    userId: string,
    updateDto: UpdateCertificateDto
  ): Promise<Certificate> {
    const { id, issueDate, expiryDate, ...rest } = updateDto;

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
      sourceCvIds: [], // Manual edit clears AI source tracking
      ...(issueDate === undefined
        ? {}
        : { issueDate: this.toPrismaDateTime(issueDate, 'issueDate') }),
      ...(expiryDate === undefined
        ? {}
        : {
            expiryDate: this.toPrismaNullableDateTime(expiryDate, 'expiryDate'),
          }),
    };

    return this.prismaClient
      .$transaction(async (tx) => {
        const updated = await tx.certificate.update({
          where: { id },
          data,
        });

        // Clear stale vector embedding
        await tx.$executeRawUnsafe(
          `UPDATE "Certificate" SET embedding = NULL WHERE id = $1`,
          id
        );

        return updated;
      })
      .then((updated) => {
        this.eventEmitter.emit('profile.item.updated', {
          model: 'Certificate',
          id: updated.id,
          content: `${updated.name} | ${updated.issuer}`,
        });
        return updated;
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
    const { issueDate, expiryDate, ...rest } = createDto;

    const result = await this.prismaClient.certificate.create({
      data: {
        ...rest,
        issueDate: this.toPrismaDateTime(issueDate, 'issueDate'),
        ...(expiryDate === undefined
          ? {}
          : {
              expiryDate: this.toPrismaNullableDateTime(
                expiryDate,
                'expiryDate'
              ),
            }),
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
        rawDescriptions: {}, // Manual creation clears AI cache
        rawTitles: {},
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

    return this.prismaClient
      .$transaction(async (tx) => {
        const updated = await tx.candidateDescription.update({
          where: { id },
          data: {
            ...data,
            rawDescriptions: {}, // Manual update clears AI cache to prevent future AI overwrites
            rawTitles: {},
          },
        });

        // Clear stale vector embedding
        await tx.$executeRawUnsafe(
          `UPDATE "CandidateDescription" SET embedding = NULL WHERE id = $1`,
          id
        );

        return updated;
      })
      .then((updated) => {
        this.eventEmitter.emit('profile.item.updated', {
          model: 'CandidateDescription',
          id: updated.id,
          content: updated.bio || '',
        });
        return updated;
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
    createDto: CreateSkillDto
  ): Promise<{
    id: number;
    skillId: number;
    title: string;
    level?: CandidateSkill['level'];
    years?: number;
  }> {
    const skillId = await this.resolveSkillIdFromInput({
      skillId: createDto.skillId,
      title: createDto.title,
    });

    try {
      const createdSkill = await this.prismaClient.candidateSkill.create({
        data: {
          candidate: { connect: { id: userId } },
          skill: { connect: { id: skillId } },
          level: createDto.level,
          years: createDto.years,
        },
        include: {
          skill: true,
        },
      });

      return {
        id: createdSkill.id,
        skillId: createdSkill.skillId,
        title: createdSkill.skill.name,
        level: createdSkill.level ?? undefined,
        years: createdSkill.years ?? undefined,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This skill is already added for the candidate.'
        );
      }

      throw error;
    }
  }

  async updateSkill(
    userId: string,
    updateDto: UpdateSkillDto
  ): Promise<{
    id: number;
    skillId: number;
    title: string;
    level?: CandidateSkill['level'];
    years?: number;
  }> {
    const { id, title, skillId, level, years } = updateDto;
    const existing = await this.prismaClient.candidateSkill.findFirst({
      where: { id, candidateId: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Skill ${id} not found or access denied.`);
    }

    const resolvedSkillId =
      skillId === undefined && title === undefined
        ? undefined
        : await this.resolveSkillIdFromInput({ skillId, title });

    try {
      return this.prismaClient
        .$transaction(async (tx) => {
          const updatedSkill = await tx.candidateSkill.update({
            where: { id },
            data: {
              sourceCvIds: [], // Manual edit clears AI source tracking
              ...(resolvedSkillId === undefined
                ? {}
                : {
                    skill: {
                      connect: { id: resolvedSkillId },
                    },
                  }),
              ...(level === undefined ? {} : { level }),
              ...(years === undefined ? {} : { years }),
            },
            include: {
              skill: true,
            },
          });

          // Clear stale vector embedding
          await tx.$executeRawUnsafe(
            `UPDATE "CandidateSkill" SET embedding = NULL WHERE id = $1`,
            id
          );

          return {
            id: updatedSkill.id,
            skillId: updatedSkill.skillId,
            title: updatedSkill.skill.name,
            level: updatedSkill.level ?? undefined,
            years: updatedSkill.years ?? undefined,
          };
        })
        .then((result) => {
          this.eventEmitter.emit('profile.item.updated', {
            model: 'CandidateSkill',
            id: result.id,
            content: result.title,
          });
          return result;
        });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This skill is already added for the candidate.'
        );
      }

      throw error;
    }
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
      data: {
        ...data,
        sourceCvIds: [], // Manual edit clears AI source tracking
      },
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
      data: {
        ...data,
        sourceCvIds: [], // Manual edit clears AI source tracking
      },
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
          await this.gcsService.deleteFile(`assets/${oldFileKey}`);
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

  async deleteAvatar(
    userId: string
  ): Promise<{ id: string; email: string; avatarUrl: string | null }> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Delete avatar from GCS if it exists
    if (user.avatarUrl) {
      try {
        const urlParts = user.avatarUrl.split('/');
        const fileKey = urlParts.slice(-2).join('/');
        if (fileKey && fileKey.startsWith('avatars/')) {
          await this.gcsService.deleteFile(`assets/${fileKey}`);
        }
      } catch (error) {
        console.error(`Warning: Failed to delete avatar from GCS.`, error);
      }
    }

    // Set avatarUrl to null in DB
    const updatedUser = await this.prismaClient.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: { id: true, email: true, avatarUrl: true },
    });

    return updatedUser;
  }

  async getCandidateProfileForEmployer(
    employerId: string,
    candidateId: string
  ): Promise<CandidateQueryResponseDto> {
    // Verify employer has access to an application from this candidate
    const hasAccess = await this.prismaClient.application.findFirst({
      where: {
        candidateId,
        job: {
          postedById: employerId,
        },
      },
    });

    if (!hasAccess) {
      throw new NotFoundException(
        `Access denied. You don't have permission to view this candidate's profile.`
      );
    }

    // Return the candidate's profile
    return this.getProfileDetails(candidateId);
  }
}
