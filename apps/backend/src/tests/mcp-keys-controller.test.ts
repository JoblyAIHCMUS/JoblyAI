import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpKeysController } from '../app/mcp/keys/mcp-keys.controller';
import { McpKeysService } from '../app/mcp/keys/mcp-keys.service';

describe('McpKeysController', () => {
  let controller: McpKeysController;
  let service: { create: ReturnType<typeof vi.fn>; list: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      delete: vi.fn(),
    };
    controller = new McpKeysController(service as unknown as McpKeysService);
  });

  describe('create', () => {
    it('calls service.create with req.user.id', async () => {
      const mockReq = { user: { id: 'user-123' } };
      const mockResult = {
        id: 'key-123',
        key: 'jobly_sk_abc123',
        prefix: 'jobly_sk_',
        name: 'API Key',
        createdAt: new Date(),
        lastRequest: null,
        expiresAt: null,
      };
      service.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockReq as never);

      expect(service.create).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('list', () => {
    it('calls service.list with request authorization header', async () => {
      const mockReq = { headers: { authorization: 'Bearer session_token' } };
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

      expect(service.list).toHaveBeenCalledWith({ authorization: 'Bearer session_token' });
      expect(result).toEqual(mockKeys);
    });
  });

  describe('delete', () => {
    it('calls service.delete with keyId', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('key-123');

      expect(service.delete).toHaveBeenCalledWith('key-123');
    });
  });
});
