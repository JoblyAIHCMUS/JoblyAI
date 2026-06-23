import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { McpKeysService } from './mcp-keys.service';
import { AuthGuard } from '../../auth/auth.guard';
import type { AuthenticatedRequest } from '../../types/authenticatedRequest';

@Controller('mcp-keys')
@UseGuards(AuthGuard)
export class McpKeysController {
  constructor(private readonly mcpKeysService: McpKeysService) {}

  @Post()
  async create(@Req() req: AuthenticatedRequest) {
    return this.mcpKeysService.create(req.user.id);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return this.mcpKeysService.list({
      authorization: req.headers.authorization,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.mcpKeysService.delete(id);
  }
}
