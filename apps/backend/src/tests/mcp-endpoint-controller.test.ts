import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpEndpointController } from '../app/mcp/server/mcp-endpoint.controller';

const noopServices = () => ({
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

const mockTransportState: {
  handleRequest: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
} = {
  handleRequest: vi.fn().mockResolvedValue(undefined),
  close: vi.fn(),
};

const mockServerState: {
  connect: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
} = {
  connect: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => {
  const MockTransport = vi.fn(function () {
    return mockTransportState;
  });
  return { StreamableHTTPServerTransport: MockTransport };
});

vi.mock('../app/mcp/server/mcp.factory', () => ({
  createMcpServer: vi.fn(() => mockServerState),
}));

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from '../app/mcp/server/mcp.factory';

describe('McpEndpointController', () => {
  let controller: McpEndpointController;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransportState.handleRequest.mockResolvedValue(undefined);
    mockServerState.connect.mockResolvedValue(undefined);
    controller = new McpEndpointController(
      {
        user: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ id: 'user-123', role: 'employer' }),
        },
        employer: { findUnique: vi.fn().mockResolvedValue({ companyId: 42 }) },
      } as never,
      noopServices().gcsService,
      noopServices().resumeParserService,
      noopServices().profileSyncService
    );
  });

  it('creates fresh transport and server per request with populated state', async () => {
    const prisma = {
      user: {
        findUnique: vi
          .fn()
          .mockResolvedValue({ id: 'user-123', role: 'employer' }),
      },
      employer: { findUnique: vi.fn().mockResolvedValue({ companyId: 42 }) },
    };
    controller = new McpEndpointController(
      prisma as never,
      noopServices().gcsService,
      noopServices().resumeParserService,
      noopServices().profileSyncService
    );

    const mockReq = {
      mcpUserId: 'user-123',
      mcpRole: 'employer',
      body: { jsonrpc: '2.0', id: 1, method: 'initialize' },
      headers: {},
    };
    const mockRes = {
      on: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await controller.handleMcp(mockReq as never, mockRes as never);

    expect(StreamableHTTPServerTransport).toHaveBeenCalledWith({
      sessionIdGenerator: undefined,
    });
    expect(createMcpServer).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        role: 'employer',
        companyId: 42,
      })
    );
    expect(mockServerState.connect).toHaveBeenCalledWith(mockTransportState);
    expect(mockTransportState.handleRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      mockReq.body
    );
  });

  it('closes transport and server on res close', async () => {
    const mockReq = {
      mcpUserId: 'user-123',
      mcpRole: 'employer',
      body: {},
      headers: {},
    };
    const mockRes = { on: vi.fn() };

    await controller.handleMcp(mockReq as never, mockRes as never);

    const closeHandler = mockRes.on.mock.calls.find(
      (call) => call[0] === 'close'
    )?.[1];
    expect(closeHandler).toBeDefined();

    await closeHandler();

    expect(mockTransportState.close).toHaveBeenCalled();
    expect(mockServerState.close).toHaveBeenCalled();
  });

  it('returns 500 if handleRequest throws and headers not sent', async () => {
    mockTransportState.handleRequest.mockRejectedValueOnce(
      new Error('Transport error')
    );

    const mockReq = {
      mcpUserId: 'user-123',
      mcpRole: 'employer',
      body: {},
      headers: {},
    };
    const mockRes = {
      on: vi.fn(),
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await controller.handleMcp(mockReq as never, mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'internal_error' });
  });

  it('passes companyId: null when caller has no Employer record', async () => {
    controller = new McpEndpointController(
      {
        user: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ id: 'user-123', role: 'candidate' }),
        },
        employer: { findUnique: vi.fn().mockResolvedValue(null) },
      } as never,
      noopServices().gcsService,
      noopServices().resumeParserService,
      noopServices().profileSyncService
    );

    const mockReq = {
      mcpUserId: 'user-123',
      mcpRole: 'candidate',
      body: { jsonrpc: '2.0', id: 1, method: 'initialize' },
      headers: {},
    };
    const mockRes = { on: vi.fn() };

    await controller.handleMcp(mockReq as never, mockRes as never);

    expect(createMcpServer).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: null })
    );
  });
});
