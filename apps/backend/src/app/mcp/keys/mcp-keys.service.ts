import { Injectable } from '@nestjs/common';
import { auth } from '../../../lib/auth';
import { McpKeyView, CreateMcpKeyResponse } from './dto/mcp-key.view';

@Injectable()
export class McpKeysService {
  async create(userId: string): Promise<CreateMcpKeyResponse> {
    const result = await auth.api.createApiKey({
      body: { userId, name: 'API Key' },
    });

    return {
      id: result.id,
      key: result.key,
      prefix: result.prefix ?? '',
      name: result.name ?? 'API Key',
      createdAt: result.createdAt,
      lastRequest: result.lastRequest ?? null,
      expiresAt: result.expiresAt ?? null,
    };
  }

  async list(headers: { authorization?: string }): Promise<McpKeyView[]> {
    const { apiKeys } = await auth.api.listApiKeys({ headers });

    return apiKeys.map((key) => ({
      id: key.id,
      name: key.name ?? '',
      prefix: key.prefix ?? '',
      createdAt: key.createdAt,
      lastRequest: key.lastRequest ?? null,
      expiresAt: key.expiresAt ?? null,
    }));
  }

  async delete(keyId: string): Promise<void> {
    await auth.api.deleteApiKey({ body: { keyId } });
  }
}
