import { Injectable } from '@nestjs/common';
import { InjectPrisma } from '../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';
import {
  QueryResponseEmployerDto,
  UpdateEmployerDto,
} from './dto/employer.dto';

@Injectable()
export class EmployerService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}
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

    // If employer profile is missing, it means the user registered as an employer
    // but hasn't set up their company yet. Return a response with null company.
    if (!data.employer) {
      return {
        id: data.id,
        company: null,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
        email: data.email,
        verified: data.emailVerified,
        banned: data.banned ?? false,
        banExpires: data.banExpires ?? undefined,
        bannedReason: data.banReason ?? '',
      };
    }

    return {
      id: data.id,
      company: data.employer.company,
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      email: data.email,
      verified: data.emailVerified,
      banned: data.banned ?? false,
      banExpires: data.banExpires ?? undefined,
      bannedReason: data.banReason ?? '',
    };
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateEmployerDto
  ): Promise<string> {
    await this.prisma.$transaction(async (tx) => {
      // use transaction to update both user and employer records in a single query
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: updateDto.firstName,
          lastName: updateDto.lastName,
        },
      });

      await tx.employer.update({
        where: { employerId: userId },
        data: {
          role: updateDto.role,
          companyId: updateDto.companyId,
        },
      });
    });

    return 'Employer with ID ' + userId + ' updated successfully';
  }
}
