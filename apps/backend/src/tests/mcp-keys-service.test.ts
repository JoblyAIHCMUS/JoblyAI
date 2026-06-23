import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '../lib/auth';
import { McpKeysService } from '../app/mcp/keys/mcp-keys.service';

describe('McpKeysService', () => {
  let service: McpKeysService;
  let createSpy: ReturnType<typeof vi.spyOn>;
  let listSpy: ReturnType<typeof vi.spyOn>;
  let deleteSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new McpKeysService();
    createSpy = vi.spyOn(auth.api, 'createApiKey');
    listSpy = vi.spyOn(auth.api, 'listApiKeys');
    deleteSpy = vi.spyOn(auth.api, 'deleteApiKey');
  });

  describe('create', () => {
    it('calls createApiKey with userId, returns view with plaintext key', async () => {
      const createdAt = new Date('2026-06-21T00:00:00Z');
      createSpy.mockResolvedValue({
        id: 'key-123',
        key: 'jobly_sk_abc123def456',
        prefix: 'jobly_sk_',
        name: 'API Key',
        createdAt,
        lastRequest: null,
        expiresAt: null,
      } as never);

      const result = await service.create('user-123');

      expect(createSpy).toHaveBeenCalledWith({
        body: { userId: 'user-123', name: 'API Key' },
      });
      expect(result).toEqual({
        id: 'key-123',
        key: 'jobly_sk_abc123def456',
        prefix: 'jobly_sk_',
        name: 'API Key',
        createdAt,
        lastRequest: null,
        expiresAt: null,
      });
    });
  });

  describe('list', () => {
    it('calls listApiKeys and strips hashed key from each result', async () => {
      const createdAt = new Date('2026-06-21T00:00:00Z');
      listSpy.mockResolvedValue({
        apiKeys: [
          {
            id: 'key-123',
            name: 'My Key',
            prefix: 'jobly_sk_',
            key: 'hashed_value_should_be_stripped',
            createdAt,
            lastRequest: null,
            expiresAt: null,
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      } as never);

      const result = await service.list({
        authorization: 'Bearer session_token',
      });

      expect(listSpy).toHaveBeenCalledWith({
        headers: { authorization: 'Bearer session_token' },
      });
      expect(result).toEqual([
        {
          id: 'key-123',
          name: 'My Key',
          prefix: 'jobly_sk_',
          createdAt,
          lastRequest: null,
          expiresAt: null,
        },
      ]);
      expect(result[0]).not.toHaveProperty('key');
    });
  });

  describe('delete', () => {
    it('calls deleteApiKey with keyId', async () => {
      deleteSpy.mockResolvedValue({ success: true } as never);

      await service.delete('key-123');

      expect(deleteSpy).toHaveBeenCalledWith({
        body: { keyId: 'key-123' },
      });
    });
  });
});
