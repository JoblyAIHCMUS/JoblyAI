export interface McpKeyView {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  lastRequest: Date | null;
  expiresAt: Date | null;
}

export interface CreateMcpKeyResponse extends McpKeyView {
  key: string;
}
