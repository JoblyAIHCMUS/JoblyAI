import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { RoleGuard } from '../auth/role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Prisma, User } from '@prisma/client';
import { UpdateEducationDto } from './dto/education.dto';
import { UpdateExperienceDto } from './dto/experience.dto';
import { UpdateResumeDto } from './dto/resume.dto';
import { UpdateCertificateDto } from './dto/certificate.dto';

export interface AuthRequest extends Request {
  user: User;
}

@Controller('candidate')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  // Get current user details if the user is logged in and a candidate
  @Get('/me')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  getProfileDetails(@Request() req: { user: User }) {
    const user = req.user;

    return this.candidatesService.getProfileDetails(user.id);
  }

  @Patch('/me/education')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateEducationDetail(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateEducationDto
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.updateEducation(userId, updateDto);
  }

  @Post('/me/education')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createEducationDetail(
    @Request() req: AuthRequest,
    @Body() createDto: Omit<Prisma.EducationCreateInput, 'candidate'>
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.createEducation(userId, createDto);
  }

  @Delete('/me/education/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteEducationDetail(
    @Request() req: AuthRequest,
    @Param('id') educationId: string
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.deleteEducation(
      userId,
      Number.parseInt(educationId)
    );
  }

  @Patch('/me/experience')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateExperienceDetail(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateExperienceDto
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.updateExperience(userId, updateDto);
  }

  @Post('/me/experience')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createExperienceDetail(
    @Request() req: AuthRequest,
    @Body() createDto: Omit<Prisma.ExperienceCreateInput, 'candidate'>
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.createExperience(userId, createDto);
  }

  @Delete('/me/experience/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteExperienceDetail(
    @Request() req: AuthRequest,
    @Param('id') experienceId: string
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.deleteExperience(
      userId,
      Number.parseInt(experienceId)
    );
  }

  @Patch('/me/resume')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateResumeDetail(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateResumeDto
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.updateResume(userId, updateDto);
  }

  @Post('/me/resume')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createResumeDetail(
    @Request() req: AuthRequest,
    @Body() createDto: Omit<Prisma.ResumeCreateInput, 'candidate'>
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.createResume(userId, createDto);
  }

  @Delete('/me/resume/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteResumeDetail(
    @Request() req: AuthRequest,
    @Param('id') resumeId: string
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.deleteResume(
      userId,
      Number.parseInt(resumeId)
    );
  }

  @Patch('/me/certification')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateCertificateDetail(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateCertificateDto
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.updateCertificate(userId, updateDto);
  }

  @Post('/me/certification')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createCertificateDetail(
    @Request() req: AuthRequest,
    @Body() createDto: Omit<Prisma.CertificateCreateInput, 'candidate'>
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.createCertificateDetail(userId, createDto);
  }

  @Delete('/me/certification/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteCertificateDetail(
    @Request() req: AuthRequest,
    @Param('id') resumeId: string
  ) {
    const { id: userId } = req.user;

    return await this.candidatesService.deleteCertificate(
      userId,
      Number.parseInt(resumeId)
    );
  }
}
