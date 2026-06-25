import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpState } from './mcp.types';
import { registerWhoamiTool } from '../tools/whoami.tool';
import { registerEmployerTools } from '../tools/employer/register-employer-tools';

export function createMcpServer(state: McpState): McpServer {
  const server = new McpServer({
    name: 'jobly-mcp',
    version: '0.2.0',
  });

  registerWhoamiTool(server, state);

  if (state.role === 'employer') {
    registerEmployerTools(server, state);
  }

  return server;
}
