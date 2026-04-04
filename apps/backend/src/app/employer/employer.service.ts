import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectPrisma } from '../decorators/inject.decorator';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  QueryResponseEmployerDto,
  UpdateEmployerDto,
} from './dto/employer.dto';

@Injectable()
export class EmployerService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

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
}
