import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SkillsService, SkillResponse } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /**
   * GET /skills/search?q=javascript
   * Search for skills by query
   */
  @Get('search')
  async searchSkills(@Query('q') query?: string): Promise<SkillResponse[]> {
    if (!query) {
      return [];
    }

    return this.skillsService.searchSkills(query);
  }

  /**
   * GET /skills?names=JavaScript,TypeScript
   * Fetch skills by names
   */
  @Get()
  async getSkillsByNames(
    @Query('names') namesParam?: string
  ): Promise<SkillResponse[]> {
    if (!namesParam) {
      return [];
    }

    // Parse comma-separated names
    const names = namesParam.split(',').filter((n) => n.trim().length > 0);
    return this.skillsService.findByNames(names);
  }

  /**
   * POST /skills
   * Create a new skill
   */
  @Post()
  async createSkill(@Body() body: { name: string }): Promise<SkillResponse> {
    if (!body.name || body.name.trim().length === 0) {
      throw new Error('Skill name is required');
    }

    return this.skillsService.createSkill(body.name);
  }
}
