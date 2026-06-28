import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { McpKeysService } from './mcp-keys.service';
import { AuthGuard } from '../../auth/auth.guard';
import type { AuthenticatedRequest } from '../../types/authenticatedRequest';
import { CreateMcpKeyDto } from './dto/create-mcp-key.dto';

@Controller('mcp-keys')
@UseGuards(AuthGuard)
export class McpKeysController {
  constructor(private readonly mcpKeysService: McpKeysService) {}

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateMcpKeyDto) {
    return this.mcpKeysService.create(req.user.id, dto, {
      headers: req.headers as Record<string, string | string[]>,
    });
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return this.mcpKeysService.list({
      headers: req.headers as Record<string, string | string[]>,
    });
  }

  @Delete(':id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.mcpKeysService.delete(id, {
      headers: req.headers as Record<string, string | string[]>,
    });
  }
}
