import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { CompanyService } from './company.service';
import {
  CompanyCreateDto,
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
  async createCompany(@Body() dto: CompanyCreateDto) {
    return this.companyService.create(dto);
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
}
