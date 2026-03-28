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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { CompanyService } from './company.service';
import {
  CompanyCreateDto,
  CompanyPatchDto,
  CompanyUpdateDto,
} from './dto/company.dto';

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
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompanyUpdateDto
  ) {
    return this.companyService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async patchCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompanyPatchDto
  ) {
    return this.companyService.patch(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async deleteCompany(@Param('id', ParseIntPipe) id: number) {
    await this.companyService.delete(id);
    return { message: `Company with ID ${id} deleted successfully` };
  }
}
