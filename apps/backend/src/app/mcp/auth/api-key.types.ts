import { Request } from 'express';

export interface RequestWithMcpUser extends Request {
  mcpUserId?: string;
}
