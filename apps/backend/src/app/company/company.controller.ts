import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { CompanyService } from './company.service';
import {
  CompanyAddEmployeeDto,
  CompanyCreateDto,
  CompanyGrantAdminDto,
  CompanyPatchDto,
  CompanyUpdateDto,
} from './dto/company.dto';

export interface AuthRequest extends Request {
  user: User;
}

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async getAllCompanies() {
    return this.companyService.getAll();
  }

  @Get(':id')
  async getCompanyById(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async createCompany(
    @Body() dto: CompanyCreateDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.companyService.create(dto, request.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async updateCompany(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompanyUpdateDto
  ) {
    return this.companyService.update(id, dto, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async patchCompany(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompanyPatchDto
  ) {
    return this.companyService.patch(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async deleteCompany(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    await this.companyService.delete(id, req.user);
    return { message: `Company with ID ${id} deleted successfully` };
  }

  @Post(':id/employees')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer')
  async addEmployee(
    @Param('id', ParseIntPipe) companyId: number,
    @Body() dto: CompanyAddEmployeeDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.companyService.addEmployee(companyId, request.user.id, dto);
  }

  @Delete(':id/employees')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer')
  async removeEmployee(
    @Param('id', ParseIntPipe) companyId: number,
    @Body() dto: CompanyAddEmployeeDto,
    @Req() request: AuthenticatedRequest
  ) {
    await this.companyService.removeEmployee(
      companyId,
      request.user.id,
      dto.email
    );

    return {
      message: `Employer with email ${dto.email} removed from company ${companyId}`,
    };
  }

  @Patch(':id/admin')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin')
  async grantCompanyAdmin(
    @Param('id', ParseIntPipe) companyId: number,
    @Body() dto: CompanyGrantAdminDto
  ) {
    return this.companyService.grantCompanyAdmin(companyId, dto.email);
  }
}
