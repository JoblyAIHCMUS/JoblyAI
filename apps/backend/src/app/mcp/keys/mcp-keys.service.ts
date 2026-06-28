import { Injectable } from '@nestjs/common';
import { auth } from '../../../lib/auth';
import { McpKeyView, CreateMcpKeyResponse } from './dto/mcp-key.view';
import { CreateMcpKeyDto } from './dto/create-mcp-key.dto';

interface McpKeysServiceOptions {
  headers: Record<string, string | string[]>;
}

@Injectable()
export class McpKeysService {
  async create(
    userId: string,
    dto: CreateMcpKeyDto
  ): Promise<CreateMcpKeyResponse> {
    // Server-side call: no headers. Better Auth's createApiKey marks `userId`
    // as a server-only property; passing headers makes it treat this as a
    // client call and reject the body-supplied userId.
    const result = await auth.api.createApiKey({
      body: {
        userId,
        name: dto.name,
        permissions: { role: [dto.role] },
      },
    });

    return {
      id: result.id,
      key: result.key,
      prefix: result.prefix ?? '',
      name: result.name ?? dto.name,
      createdAt: result.createdAt,
      lastRequest: result.lastRequest ?? null,
      expiresAt: result.expiresAt ?? null,
      role: dto.role,
    };
  }

  async list(options: McpKeysServiceOptions): Promise<McpKeyView[]> {
    const { apiKeys } = await auth.api.listApiKeys({
      headers: options.headers,
    });

    return apiKeys.map((key) => {
      const permissions = key.permissions as
        | { role?: string[] }
        | null
        | undefined;
      const role = permissions?.role?.[0];
      return {
        id: key.id,
        name: key.name ?? '',
        prefix: key.prefix ?? '',
        createdAt: key.createdAt,
        lastRequest: key.lastRequest ?? null,
        expiresAt: key.expiresAt ?? null,
        role: role === 'employer' || role === 'candidate' ? role : null,
      };
    });
  }

  async delete(
    keyId: string,
    options: McpKeysServiceOptions
  ): Promise<void> {
    await auth.api.deleteApiKey({
      body: { keyId },
      headers: options.headers,
    });
  }
}
