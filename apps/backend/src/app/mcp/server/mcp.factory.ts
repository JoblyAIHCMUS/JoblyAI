import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpState } from './mcp.types';
import { registerWhoamiTool } from '../tools/whoami.tool';

export function createMcpServer(state: McpState): McpServer {
  const server = new McpServer({
    name: 'jobly-mcp',
    version: '0.1.0',
  });

  registerWhoamiTool(server, state);

  return server;
}
