import { PrismaClient } from '@prisma/client';
import { UpdateUserDTO } from './dto/user.dto';

export class UserService {
  constructor(@InjectPrisma() private readonly prismaClient: PrismaClient) {}

  async updateUserProfile(
    userId: string,
    updateDto: UpdateUserDTO
  ): Promise<string> {
    const { firstName, lastName } = updateDto;
    await this.prismaClient.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
      },
    });
    return `Profile with ID: ${userId.toString()} updated successfully`;
  }
}
