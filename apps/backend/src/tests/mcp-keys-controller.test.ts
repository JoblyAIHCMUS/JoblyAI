import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpKeysController } from '../app/mcp/keys/mcp-keys.controller';
import { McpKeysService } from '../app/mcp/keys/mcp-keys.service';

describe('McpKeysController', () => {
  let controller: McpKeysController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      delete: vi.fn(),
    };
    controller = new McpKeysController(service as unknown as McpKeysService);
  });

  describe('create', () => {
    it('calls service.create with req.user.id, body DTO, and request headers', async () => {
      const mockReq = {
        user: { id: 'user-123' },
        headers: { cookie: 'better-auth.session_token=abc' },
      };
      const mockBody = { role: 'employer' as const, name: 'My Key' };
      const mockResult = {
        id: 'key-123',
        key: 'jobly_sk_abc123',
        prefix: 'jobly_sk_',
        name: 'My Key',
        createdAt: new Date(),
        lastRequest: null,
        expiresAt: null,
        role: 'employer',
      };
      service.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockReq as never, mockBody);

      expect(service.create).toHaveBeenCalledWith('user-123', mockBody, {
        headers: { cookie: 'better-auth.session_token=abc' },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('list', () => {
    it('calls service.list with request headers', async () => {
      const mockReq = {
        headers: { cookie: 'better-auth.session_token=abc' },
      };
      const mockKeys = [
        {
          id: 'key-123',
          name: 'My Key',
          prefix: 'jobly_sk_',
          createdAt: new Date(),
          lastRequest: null,
          expiresAt: null,
        },
      ];
      service.list.mockResolvedValue(mockKeys);

      const result = await controller.list(mockReq as never);

      expect(service.list).toHaveBeenCalledWith({
        headers: { cookie: 'better-auth.session_token=abc' },
      });
      expect(result).toEqual(mockKeys);
    });
  });

  describe('delete', () => {
    it('calls service.delete with keyId and request headers', async () => {
      const mockReq = {
        headers: { cookie: 'better-auth.session_token=abc' },
      };
      service.delete.mockResolvedValue(undefined);

      await controller.delete(mockReq as never, 'key-123');

      expect(service.delete).toHaveBeenCalledWith('key-123', {
        headers: { cookie: 'better-auth.session_token=abc' },
      });
    });
  });
});
