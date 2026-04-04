import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Company, Prisma, PrismaClient, type User } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import {
  CompanyCreateDto,
  CompanyPatchDto,
  CompanyUpdateDto,
} from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

  async getAll(): Promise<Company[]> {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: number): Promise<Company> {
    const company = await this.prisma.company.findUnique({ where: { id } });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async create(dto: CompanyCreateDto): Promise<Company> {
    try {
      return await this.prisma.company.create({ data: dto });
    } catch (error) {
      this.mapPrismaError(error, dto.name);
    }
  }

  async update(
    id: number,
    dto: CompanyUpdateDto,
    user: User
  ): Promise<Company> {
    return this.applyCompanyUpdate(id, dto, user);
  }

  async patch(id: number, dto: CompanyPatchDto, user: User): Promise<Company> {
    return this.applyCompanyUpdate(id, dto, user);
  }

  private async applyCompanyUpdate(
    id: number,
    dto: CompanyUpdateDto | CompanyPatchDto,
    user: User
  ): Promise<Company> {
    await this.ensureCompanyExists(id);
    await this.ensureCompanyAccess(id, user);

    try {
      return await this.prisma.company.update({ where: { id }, data: dto });
    } catch (error) {
      this.mapPrismaError(error, dto.name);
    }
  }

  async delete(id: number, user: User): Promise<void> {
    await this.ensureCompanyExists(id);
    await this.ensureCompanyAccess(id, user);
    await this.prisma.company.delete({ where: { id } });
  }

  private async ensureCompanyAccess(id: number, user: User): Promise<void> {
    if (user.role === 'admin') {
      return;
    }

    const membership = await this.prisma.employer.findFirst({
      where: {
        companyId: id,
        employerId: user.id,
      },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenException(
        `You are not allowed to modify company with ID ${id}`
      );
    }
  }

  private async ensureCompanyExists(id: number): Promise<void> {
    const existing = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
  }

  private mapPrismaError(error: unknown, companyName?: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        `Company with name '${companyName ?? 'provided'}' already exists`
      );
    }

    throw error;
  }
}
