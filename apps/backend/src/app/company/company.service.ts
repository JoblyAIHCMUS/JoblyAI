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
  type User,
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

  async checkNameExists(name: string): Promise<boolean> {
    const company = await this.prisma.company.findUnique({
      where: { name },
      select: { id: true },
    });
    return !!company;
  }

  async create(dto: CompanyCreateDto, creatorUserId: string): Promise<Company> {
    // Check if creator is already an employer in another company
    const existingEmployer = await this.prisma.employer.findUnique({
      where: { employerId: creatorUserId },
      select: { companyId: true },
    });

    if (existingEmployer && existingEmployer.companyId !== null) {
      throw new ConflictException(
        'You are already an employee of another company and cannot create a new one'
      );
    }

    try {
      // Create company and employer in a transaction
      const company = await this.prisma.$transaction(async (tx) => {
        // Create the company
        const newCompany = await tx.company.create({ data: dto });

        // Create employer record for creator
        const employerRecord = await tx.employer.create({
          data: {
            companyId: newCompany.id,
            employerId: creatorUserId,
            role: 'admin',
          },
        });

        // Update company to set creator as admin
        return tx.company.update({
          where: { id: newCompany.id },
          data: { adminId: employerRecord.id },
        });
      });

      return company;
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

  async addEmployee(
    companyId: number,
    requesterUserId: string,
    dto: CompanyAddEmployeeDto
  ): Promise<Employer> {
    await this.assertRequesterIsCompanyAdminEmployer(
      companyId,
      requesterUserId
    );

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} not found`);
    }

    if (user.role !== 'employer') {
      throw new BadRequestException(
        `User with email ${dto.email} is not an employer`
      );
    }

    // Check if employer already belongs to a company
    const existingMembership = await this.prisma.employer.findUnique({
      where: { employerId: user.id },
      select: { id: true, companyId: true },
    });

    if (existingMembership) {
      if (existingMembership.companyId === companyId) {
        throw new ConflictException(
          `Employer with email ${dto.email} is already a member of this company`
        );
      }

      if (existingMembership.companyId !== null) {
        throw new ConflictException(
          `Employer with email ${dto.email} is already associated with another company`
        );
      }

      // If employer previously belonged to a company but was removed (companyId = null), re-add them
      return this.prisma.employer.update({
        where: { employerId: user.id },
        data: {
          companyId,
          role: dto.role ?? 'employee',
        },
      });
    }

    // Create new employer record
    return this.prisma.employer.create({
      data: {
        companyId,
        employerId: user.id,
        role: dto.role ?? 'employee',
      },
    });
  }

  async removeEmployee(
    companyId: number,
    requesterUserId: string,
    employerEmail: string
  ): Promise<void> {
    const company = await this.assertRequesterIsCompanyAdminEmployer(
      companyId,
      requesterUserId
    );

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: employerEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${employerEmail} not found`);
    }

    const membership = await this.prisma.employer.findUnique({
      where: { employerId: user.id },
      select: { id: true, companyId: true },
    });

    if (membership?.companyId !== companyId) {
      throw new NotFoundException(
        `Employer with email ${employerEmail} is not an employee of company ${companyId}`
      );
    }

    if (company.adminId === membership.id) {
      throw new BadRequestException(
        'Cannot remove current company admin. Assign another admin first.'
      );
    }

    await this.prisma.employer.update({
      where: { employerId: user.id },
      data: { companyId: null },
    });
  }

  async grantCompanyAdmin(
    companyId: number,
    employerEmail: string
  ): Promise<Company> {
    await this.ensureCompanyExists(companyId);

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: employerEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${employerEmail} not found`);
    }

    const membership = await this.prisma.employer.findUnique({
      where: { employerId: user.id },
      select: { id: true, companyId: true },
    });

    if (membership?.companyId !== companyId) {
      throw new NotFoundException(
        `Employer with email ${employerEmail} is not an employee of company ${companyId}`
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
          `Employer with email ${employerEmail} is already admin of another company`
        );
      }

      throw error;
    }
  }

  private async ensureCompanyAccess(id: number, user: User): Promise<void> {
    if (user.role === 'admin') {
      return;
    }

    const membership = await this.prisma.employer.findFirst({
      where: {
        companyId: id,
        employerId: user.id,
        adminFor: { id: id },
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
