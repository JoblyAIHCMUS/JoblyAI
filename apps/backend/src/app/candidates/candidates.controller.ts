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
import { UpdateAboutDto, CreateAboutDto } from './dto/about.dto';
import { UpdateSkillDto, CreateSkillDto } from './dto/skill.dto';
import { UpdateContactDto, CreateContactDto } from './dto/contact.dto';
import { UpdateSocialDto, CreateSocialDto } from './dto/social.dto';
import { UpdateEducationDto } from './dto/education.dto';
import { UpdateExperienceDto } from './dto/experience.dto';
import { UpdateResumeDto } from './dto/resume.dto';
import { UpdateCertificateDto } from './dto/certificate.dto';
import { UpdateAvatarDto } from './dto/avatar.dto';

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

    return await this.candidatesService.createCertificateDetail(
      userId,
      createDto
    );
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

  // About/CandidateDescription endpoints
  @Get('/me/about')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async getAboutDetail(@Request() req: AuthRequest) {
    const { id: userId } = req.user;
    return this.candidatesService.getAbout(userId);
  }

  @Post('/me/about')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createAboutDetail(
    @Request() req: AuthRequest,
    @Body() createDto: CreateAboutDto
  ) {
    const { id: userId } = req.user;
    return this.candidatesService.createAbout(userId, createDto);
  }

  @Patch('/me/about')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateAboutDetail(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateAboutDto
  ) {
    const { id: userId } = req.user;
    return this.candidatesService.updateAbout(userId, updateDto);
  }

  @Delete('/me/about/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteAboutDetail(
    @Request() req: AuthRequest,
    @Param('id') aboutId: string
  ) {
    const { id: userId } = req.user;
    return this.candidatesService.deleteAbout(userId, Number.parseInt(aboutId));
  }

  // Skills endpoints
  @Get('/me/skills')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async getSkills(@Request() req: AuthRequest) {
    const profile = await this.candidatesService.getProfileDetails(req.user.id);
    return profile.skills;
  }

  @Post('/me/skills')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createSkill(
    @Request() req: AuthRequest,
    @Body() createDto: CreateSkillDto
  ) {
    return this.candidatesService.createSkill(req.user.id, createDto);
  }

  @Patch('/me/skills')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateSkill(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateSkillDto
  ) {
    return this.candidatesService.updateSkill(req.user.id, updateDto);
  }

  @Delete('/me/skills/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteSkill(@Request() req: AuthRequest, @Param('id') skillId: string) {
    return this.candidatesService.deleteSkill(
      req.user.id,
      Number.parseInt(skillId)
    );
  }

  @Get('/me/contacts')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async getContacts(@Request() req: AuthRequest) {
    const profile = await this.candidatesService.getProfileDetails(req.user.id);
    return profile.contacts;
  }

  @Post('/me/contacts')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createContact(
    @Request() req: AuthRequest,
    @Body() createDto: CreateContactDto
  ) {
    return this.candidatesService.createContact(req.user.id, createDto);
  }

  @Patch('/me/contacts')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateContact(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateContactDto
  ) {
    return this.candidatesService.updateContact(req.user.id, updateDto);
  }

  @Delete('/me/contacts/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteContact(
    @Request() req: AuthRequest,
    @Param('id') contactId: string
  ) {
    return this.candidatesService.deleteContact(
      req.user.id,
      Number.parseInt(contactId)
    );
  }

  @Get('/me/socials')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async getSocials(@Request() req: AuthRequest) {
    const profile = await this.candidatesService.getProfileDetails(req.user.id);
    return profile.socials;
  }

  @Post('/me/socials')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async createSocial(
    @Request() req: AuthRequest,
    @Body() createDto: CreateSocialDto
  ) {
    return this.candidatesService.createSocial(req.user.id, createDto);
  }

  @Patch('/me/socials')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateSocial(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateSocialDto
  ) {
    return this.candidatesService.updateSocial(req.user.id, updateDto);
  }

  @Delete('/me/socials/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async deleteSocial(
    @Request() req: AuthRequest,
    @Param('id') socialId: string
  ) {
    return this.candidatesService.deleteSocial(
      req.user.id,
      Number.parseInt(socialId)
    );
  }

  /**
   * UPDATE AVATAR
   *
   * PATCH /api/candidate/me/avatar
   *
   * Body: {
   *   fileKey: "assets/avatars/uuid.jpg",
   *   fileUrl: "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/avatars/uuid.jpg"
   * }
   *
   * Notes:
   * - Avatar is PUBLIC (stored in S3 bucket with public read access)
   * - Deletes old avatar from S3 if one exists
   * - Updates user's avatarUrl in database
   *
   * Response: {
   *   id: "user-id",
   *   avatarUrl: "https://...",
   *   ...other user fields
   * }
   */
  @Patch('/me/avatar')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async updateAvatar(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateAvatarDto
  ) {
    const { id: userId } = req.user;
    return await this.candidatesService.updateAvatar(userId, updateDto);
  }
}
