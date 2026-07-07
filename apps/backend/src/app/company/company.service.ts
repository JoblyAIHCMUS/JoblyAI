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
import { GcsService } from '../gcs/gcs.service';
import {
  CompanyAddEmployeeDto,
  CompanyCreateDto,
  CompanyLogoDto,
  CompanyPatchDto,
  CompanyUpdateDto,
} from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly gcsService: GcsService
  ) {}

  async getAll(): Promise<Company[]> {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: number): Promise<any> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        employers: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            jobPostings: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async getBySlug(slug: string): Promise<any> {
    const company = await this.prisma.company.findFirst({
      where: { slug: this.toSlug(slug) },
      include: {
        employers: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            jobPostings: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with slug '${slug}' not found`);
    }

    return company;
  }

  async getTopCompaniesWithMostJobs(limit: number): Promise<Company[]> {
    return this.prisma.company.findMany({
      take: limit,
      orderBy: {
        jobPostings: {
          _count: 'desc',
        },
      },
      where: {
        jobPostings: {
          some: {},
        },
      },
    });
  }

  async getRecommendedCompanies(limit: number) {
    return this.prisma.company.findMany({
      take: limit,
      orderBy: {
        jobPostings: {
          _count: 'desc',
        },
      },
      where: {
        jobPostings: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        websiteUrl: true,
        sizeRange: true,
        industry: true,
        description: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            jobPostings: true,
          },
        },
      },
    });
  }

  async getEmployees(
    companyId: number,
    requesterUserId: string
  ): Promise<
    Array<{
      membershipId: number;
      employerId: string;
      role: string;
      assignedAt: Date;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
    }>
  > {
    await this.assertRequesterIsCompanyAdminEmployer(
      companyId,
      requesterUserId
    );

    const employees = await this.prisma.employer.findMany({
      where: { companyId },
      select: {
        id: true,
        employerId: true,
        role: true,
        assignedAt: true,
        employer: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ assignedAt: 'asc' }],
    });

    return employees.map((member) => {
      const nameParts = member.employer.name?.trim().split(/\s+/) ?? [];
      const firstName = member.employer.firstName ?? nameParts[0] ?? '';
      const lastName = member.employer.lastName ?? nameParts.slice(1).join(' ');

      return {
        membershipId: member.id,
        employerId: member.employerId,
        role: member.role,
        assignedAt: member.assignedAt,
        firstName,
        lastName,
        email: member.employer.email,
        avatarUrl: member.employer.avatarUrl,
      };
    });
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
        const slug = await this.generateUniqueSlug(dto.name);
        const newCompany = await tx.company.create({
          data: {
            ...dto,
            slug,
          },
        });

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
      const data =
        dto.name !== undefined
          ? {
              ...dto,
              slug: await this.generateUniqueSlug(dto.name, id),
            }
          : dto;

      return await this.prisma.company.update({ where: { id }, data });
    } catch (error) {
      this.mapPrismaError(error, dto.name);
    }
  }

  async delete(id: number, user: User): Promise<void> {
    await this.ensureCompanyExists(id);
    await this.ensureCompanyAccess(id, user);
    await this.prisma.company.delete({ where: { id } });
  }

  async updateLogo(
    id: number,
    updateDto: CompanyLogoDto,
    user: User
  ): Promise<Company> {
    // Ensure company exists and user has access
    await this.ensureCompanyExists(id);
    await this.ensureCompanyAccess(id, user);

    // Get current company to retrieve old logo info
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true, logoUrl: true },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    // Update DB with new logo URL
    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: { logoUrl: updateDto.fileUrl },
    });

    // Delete old logo from S3 if it exists and is different from new one
    if (company.logoUrl && company.logoUrl !== updateDto.fileUrl) {
      try {
        // Extract fileKey from logoUrl (e.g., "assets/logos/uuid.jpg" from full URL)
        const urlParts = company.logoUrl.split('/');
        const oldFileKey = urlParts.slice(-2).join('/'); // Get last 2 parts: "logos/uuid.jpg"

        if (oldFileKey && oldFileKey.startsWith('logos/')) {
          await this.gcsService.deleteFile(`assets/${oldFileKey}`);
        }
      } catch (error) {
        // Log the error but don't fail the operation
        console.error(
          `Warning: Failed to delete old company logo from S3. New logo has been saved to DB.`,
          error
        );
        // Continue - company's new logo is already saved in DB
      }
    }

    return updatedCompany;
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

  private toSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(
    name: string,
    excludeCompanyId?: number
  ): Promise<string> {
    const baseSlug = this.toSlug(name) || 'company';
    let candidate = baseSlug;
    let suffix = 2;

    while (
      await this.prisma.company.findFirst({
        where: {
          slug: candidate,
          ...(excludeCompanyId ? { NOT: { id: excludeCompanyId } } : {}),
        },
        select: { id: true },
      })
    ) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidate;
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
