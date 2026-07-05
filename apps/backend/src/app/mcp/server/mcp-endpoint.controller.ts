import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  Logger,
  Inject,
} from '@nestjs/common';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PrismaClient } from '@prisma/client';
import { ApiKeyGuard } from '../auth/api-key.guard';
import type { RequestWithMcpUser } from '../auth/api-key.types';
import { createMcpServer } from './mcp.factory';
import type { Response } from 'express';
import { GcsService } from '../../gcs/gcs.service';
import { ResumeParserService } from '../../ai/resume-parser.service';
import { ProfileSyncService } from '../../ai/profile-sync.service';

@Controller('mcp')
@UseGuards(ApiKeyGuard)
export class McpEndpointController {
  private readonly logger = new Logger(McpEndpointController.name);

  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly gcsService: GcsService,
    private readonly resumeParserService: ResumeParserService,
    private readonly profileSyncService: ProfileSyncService
  ) {}

  @All()
  async handleMcp(
    @Req() req: RequestWithMcpUser,
    @Res() res: Response
  ): Promise<void> {
    if (!req.mcpUserId || !req.mcpRole) {
      this.logger.error('mcpUserId or mcpRole missing on request after guard');
      if (!res.headersSent) {
        res.status(500).json({ error: 'internal_error' });
      }
      return;
    }
    const userId = req.mcpUserId;
    const role = req.mcpRole;

    const employer = await this.prisma.employer.findUnique({
      where: { employerId: userId },
      select: { companyId: true },
    });

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = createMcpServer({
      userId,
      role,
      companyId: employer?.companyId ?? null,
      prisma: this.prisma,
      logger: this.logger,
      gcsService: this.gcsService,
      resumeParserService: this.resumeParserService,
      profileSyncService: this.profileSyncService,
    });

    await server.connect(transport);
    res.on('close', () => {
      void transport.close();
      void server.close();
    });

    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      this.logger.error({ err, userId }, 'mcp.handleRequest failed');
      if (!res.headersSent) {
        res.status(500).json({ error: 'internal_error' });
      }
    }
  }
}
