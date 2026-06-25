import { Request } from 'express';
import { McpRole } from '../server/mcp.types';

export interface RequestWithMcpUser extends Request {
  mcpUserId?: string;
  mcpRole?: McpRole;
}
