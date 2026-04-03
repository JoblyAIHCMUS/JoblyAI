import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Gender } from '@prisma/client';
import { UpdateUserDTO } from './dto/user.dto';
import { InjectPrisma } from '../decorators/inject.decorator';

export interface UpdateUserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  avatarUrl?: string;
}

@Injectable()
export class UserService {
  constructor(@InjectPrisma() private readonly prismaClient: PrismaClient) {}

  private formatDateOfBirth(
    dateOfBirth: Date | null | undefined
  ): string | undefined {
    if (!dateOfBirth) return undefined;
    return dateOfBirth.toISOString().split('T')[0];
  }

  private mapUserToResponse(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    dateOfBirth: Date | null;
    gender: Gender | null;
    avatarUrl: string | null;
  }): UpdateUserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phoneNumber: user.phoneNumber || undefined,
      dateOfBirth: this.formatDateOfBirth(user.dateOfBirth),
      gender: user.gender || undefined,
      avatarUrl: user.avatarUrl || undefined,
    };
  }

  async updateUserProfile(
    userId: string,
    updateDto: UpdateUserDTO
  ): Promise<UpdateUserResponse> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Check if user exists
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update only provided fields
    const data: Record<string, any> = {};
    if (updateDto.firstName !== undefined) data.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined) data.lastName = updateDto.lastName;
    if (updateDto.phoneNumber !== undefined)
      data.phoneNumber = updateDto.phoneNumber;
    if (updateDto.dateOfBirth !== undefined)
      data.dateOfBirth = new Date(updateDto.dateOfBirth);
    if (updateDto.gender !== undefined) data.gender = updateDto.gender;
    if (updateDto.avatarUrl !== undefined) data.avatarUrl = updateDto.avatarUrl;

    // If no fields to update, return current user
    if (Object.keys(data).length === 0) {
      return this.mapUserToResponse(user);
    }

    const updated = await this.prismaClient.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        avatarUrl: true,
      },
    });

    return this.mapUserToResponse(updated);
  }
}
