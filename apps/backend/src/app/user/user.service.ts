import { PrismaClient } from '@prisma/client';
import { UpdateUserDTO } from './dto/user.dto';
import { InjectPrisma } from '../decorators/inject.decorator';

export class UserService {
  constructor(@InjectPrisma() private readonly prismaClient: PrismaClient) {}

  async updateUserProfile(
    userId: string,
    updateDto: UpdateUserDTO
  ): Promise<string> {
    const { firstName, lastName, avatarUrl } = updateDto;
    await this.prismaClient.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        avatarUrl,
      },
    });
    return `Profile with ID: ${userId.toString()} updated successfully`;
  }
}
