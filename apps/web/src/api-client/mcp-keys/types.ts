export type McpRole = 'employer' | 'candidate';

export interface McpKeyView {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastRequest: string | null;
  expiresAt: string | null;
  role: McpRole | null;
}

export interface CreateMcpKeyResponse extends McpKeyView {
  key: string;
}

export interface CreateMcpKeyDto {
  role: McpRole;
  name: string;
}
