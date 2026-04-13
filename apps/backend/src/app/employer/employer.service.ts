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
import { SearchEmployerItemDto } from './dto/employer-search.dto';

type SearchEmployerUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
  avatarUrl: string | null;
};

@Injectable()
export class EmployerService {
  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly s3Service: S3Service
  ) {}

  private splitName(name?: string | null): {
    firstName: string;
    lastName: string;
  } {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      return { firstName: '', lastName: '' };
    }

    const [firstName = '', ...lastNameParts] = trimmed.split(/\s+/);

    return {
      firstName,
      lastName: lastNameParts.join(' '),
    };
  }

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

  async searchEmployers(params: {
    requesterId: string;
    name?: string;
    email?: string;
    offset?: number;
    limit?: number;
  }): Promise<SearchEmployerItemDto[]> {
    const normalizedName = params.name?.trim();
    const normalizedEmail = params.email?.trim();

    if (!normalizedName && !normalizedEmail) {
      throw new BadRequestException('Either name or email must be provided');
    }

    const limit = params.limit ?? 5;
    const offset = params.offset ?? 0;

    const orConditions: Prisma.UserWhereInput[] = [];

    if (normalizedEmail) {
      orConditions.push({
        email: {
          contains: normalizedEmail,
          mode: 'insensitive',
        },
      });
    }

    if (normalizedName) {
      orConditions.push(
        {
          firstName: {
            contains: normalizedName,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: normalizedName,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: normalizedName,
            mode: 'insensitive',
          },
        }
      );

      const nameTokens = normalizedName.split(/\s+/).filter(Boolean);
      if (nameTokens.length > 1) {
        nameTokens.forEach((token) => {
          orConditions.push(
            {
              firstName: {
                contains: token,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: token,
                mode: 'insensitive',
              },
            }
          );
        });
      }
    }

    const users = (await this.prisma.user.findMany({
      where: {
        id: { not: params.requesterId },
        role: 'employer',
        banned: { not: true },
        OR: orConditions,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      skip: offset,
      take: limit,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { email: 'asc' }],
    })) as SearchEmployerUser[];

    return users.map((user: SearchEmployerUser) => {
      const displayName = this.splitName(user.name);

      return {
        id: user.id,
        firstName: user.firstName ?? displayName.firstName,
        lastName: user.lastName ?? displayName.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl || undefined,
      };
    });
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
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
