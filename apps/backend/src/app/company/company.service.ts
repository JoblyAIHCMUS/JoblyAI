import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type Company,
  type Employer,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import {
  CompanyAddEmployeeDto,
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

  async update(id: number, dto: CompanyUpdateDto): Promise<Company> {
    await this.ensureCompanyExists(id);

    try {
      return await this.prisma.company.update({ where: { id }, data: dto });
    } catch (error) {
      this.mapPrismaError(error, dto.name);
    }
  }

  async patch(id: number, dto: CompanyPatchDto): Promise<Company> {
    await this.ensureCompanyExists(id);

    try {
      return await this.prisma.company.update({ where: { id }, data: dto });
    } catch (error) {
      this.mapPrismaError(error, dto.name);
    }
  }

  async delete(id: number): Promise<void> {
    await this.ensureCompanyExists(id);
    await this.prisma.company.delete({ where: { id } });
  }

  async addEmployee(
    companyId: number,
    requesterUserId: string,
    dto: CompanyAddEmployeeDto
  ): Promise<Employer> {
    await this.assertRequesterIsCompanyAdminEmployer(
      companyId,
      requesterUserId
    );

    const user = await this.prisma.user.findUnique({
      where: { id: dto.employerId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.employerId} not found`);
    }

    if (user.role !== 'employer') {
      throw new BadRequestException(
        `User with ID ${dto.employerId} is not an employer`
      );
    }

    const existingMembership = await this.prisma.employer.findUnique({
      where: { employerId: dto.employerId },
      select: { companyId: true },
    });

    if (existingMembership) {
      if (existingMembership.companyId === companyId) {
        throw new ConflictException(
          `User with ID ${dto.employerId} is already an employee of this company`
        );
      }

      if (existingMembership.companyId !== null) {
        throw new ConflictException(
          `User with ID ${dto.employerId} already belongs to another company`
        );
      }

      return this.prisma.employer.update({
        where: { employerId: dto.employerId },
        data: {
          companyId,
          role: dto.role ?? 'employee',
        },
      });
    }

    return this.prisma.employer.create({
      data: {
        companyId,
        employerId: dto.employerId,
        role: dto.role ?? 'employee',
      },
    });
  }

  async removeEmployee(
    companyId: number,
    requesterUserId: string,
    employerUserId: string
  ): Promise<void> {
    const company = await this.assertRequesterIsCompanyAdminEmployer(
      companyId,
      requesterUserId
    );

    const membership = await this.prisma.employer.findUnique({
      where: { employerId: employerUserId },
      select: { id: true, companyId: true },
    });

    if (membership?.companyId !== companyId) {
      throw new NotFoundException(
        `Employer ${employerUserId} is not an employee of company ${companyId}`
      );
    }

    if (company.adminId === membership.id) {
      throw new BadRequestException(
        'Cannot remove current company admin. Assign another admin first.'
      );
    }

    await this.prisma.employer.update({
      where: { employerId: employerUserId },
      data: { companyId: null },
    });
  }

  async grantCompanyAdmin(
    companyId: number,
    employerUserId: string
  ): Promise<Company> {
    await this.ensureCompanyExists(companyId);

    const membership = await this.prisma.employer.findUnique({
      where: { employerId: employerUserId },
      select: { id: true, companyId: true },
    });

    if (membership?.companyId !== companyId) {
      throw new NotFoundException(
        `Employer ${employerUserId} is not an employee of company ${companyId}`
      );
    }

    try {
      return await this.prisma.company.update({
        where: { id: companyId },
        data: { adminId: membership.id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Employer ${employerUserId} is already admin of another company`
        );
      }

      throw error;
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

  private async assertRequesterIsCompanyAdminEmployer(
    companyId: number,
    requesterUserId: string
  ): Promise<{ adminId: number | null }> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, adminId: true },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const requesterEmployerMembership = await this.prisma.employer.findFirst({
      where: {
        companyId,
        employerId: requesterUserId,
      },
      select: { id: true },
    });

    if (
      !requesterEmployerMembership ||
      company.adminId !== requesterEmployerMembership.id
    ) {
      throw new ForbiddenException(
        'Only the company admin employer can perform this action'
      );
    }

    return { adminId: company.adminId };
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
