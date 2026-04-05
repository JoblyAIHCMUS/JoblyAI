import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPrisma } from '../decorators/inject.decorator';
import { Prisma, PrismaClient } from '@prisma/client';
import { S3Service } from '../s3/s3.service';
import {
  QueryResponseEmployerDto,
  UpdateEmployerDto,
} from './dto/employer.dto';
import { UpdateAvatarDto } from './dto/avatar.dto';

@Injectable()
export class EmployerService {
  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly s3Service: S3Service
  ) {}

  private async getPersonalProfileDetails(userId: string): Promise<{
    phoneNumber?: string;
    dateOfBirth?: Date;
    gender?: string;
    avatarUrl?: string;
  }> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        phoneNumber: string | null;
        dateOfBirth: Date | null;
        gender: string | null;
        avatarUrl: string | null;
      }>
    >(Prisma.sql`
      SELECT "phoneNumber", "dateOfBirth", "gender", "avatarUrl"
      FROM "user"
      WHERE "id" = ${userId}
      LIMIT 1
    `);

    const row = rows[0];
    if (!row) {
      return {};
    }

    return {
      phoneNumber: row.phoneNumber ?? undefined,
      dateOfBirth: row.dateOfBirth ?? undefined,
      gender: row.gender ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,
    };
  }

  async getProfileDetails(userId: string): Promise<QueryResponseEmployerDto> {
    const data = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employer: { include: { company: true } },
      },
    });

    if (!data) {
      throw new Error('User not found');
    }

    const personalProfile = await this.getPersonalProfileDetails(userId);

    // If employer profile is missing, it means the user registered as an employer
    // but hasn't set up their company yet. Return a response with null company.
    if (!data.employer) {
      return {
        id: data.id,
        company: null,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phoneNumber: personalProfile.phoneNumber,
        dateOfBirth: personalProfile.dateOfBirth,
        gender: personalProfile.gender,
        avatarUrl: personalProfile.avatarUrl,
        fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
        email: data.email,
        verified: data.emailVerified,
        banned: data.banned ?? false,
        banExpires: data.banExpires ?? undefined,
        bannedReason: data.banReason ?? '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }

    return {
      id: data.id,
      company: data.employer.company,
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      phoneNumber: personalProfile.phoneNumber,
      dateOfBirth: personalProfile.dateOfBirth,
      gender: personalProfile.gender,
      avatarUrl: personalProfile.avatarUrl,
      fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      email: data.email,
      verified: data.emailVerified,
      banned: data.banned ?? false,
      banExpires: data.banExpires ?? undefined,
      bannedReason: data.banReason ?? '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateEmployerDto
  ): Promise<QueryResponseEmployerDto> {
    await this.prisma.$transaction(async (tx) => {
      const userData: Record<string, string> = {};
      if (updateDto.firstName !== undefined) {
        userData.firstName = updateDto.firstName;
      }
      if (updateDto.lastName !== undefined) {
        userData.lastName = updateDto.lastName;
      }

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
        });
      }

      const existingEmployer = await tx.employer.findUnique({
        where: { employerId: userId },
        select: { id: true },
      });

      if (!existingEmployer) {
        if (updateDto.companyId === undefined) {
          throw new BadRequestException(
            'companyId is required to initialize employer profile'
          );
        }

        await tx.employer.create({
          data: {
            employerId: userId,
            companyId: updateDto.companyId,
            role: updateDto.role ?? 'owner',
          },
        });

        return;
      }

      const employerData: Record<string, number | string> = {};
      if (updateDto.role !== undefined) {
        employerData.role = updateDto.role;
      }
      if (updateDto.companyId !== undefined) {
        employerData.companyId = updateDto.companyId;
      }

      if (Object.keys(employerData).length > 0) {
        await tx.employer.update({
          where: { employerId: userId },
          data: employerData,
        });
      }
    });

    return this.getProfileDetails(userId);
  }

  async updateAvatar(
    userId: string,
    updateDto: UpdateAvatarDto
  ): Promise<{ id: string; email: string; avatarUrl: string | null }> {
    // Get current user with their existing avatar info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update DB with new avatar URL
    const updatedUser = await this.prisma.user.update({
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
