export interface McpKeyView {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  lastRequest: Date | null;
  expiresAt: Date | null;
  role: 'employer' | 'candidate' | null;
}

export interface CreateMcpKeyResponse extends McpKeyView {
  key: string;
}
