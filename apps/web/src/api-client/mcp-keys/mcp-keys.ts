import { apiClient } from '@/lib/api';
import {
  McpKeyView,
  CreateMcpKeyDto,
  CreateMcpKeyResponse,
} from './types';

export async function listMcpKeys(): Promise<McpKeyView[]> {
  const response = await apiClient.get<McpKeyView[]>('/mcp-keys');
  return response.data;
}

export async function createMcpKey(
  dto: CreateMcpKeyDto
): Promise<CreateMcpKeyResponse> {
  const response = await apiClient.post<CreateMcpKeyResponse>(
    '/mcp-keys',
    dto
  );
  return response.data;
}

export async function deleteMcpKey(id: string): Promise<void> {
  await apiClient.delete(`/mcp-keys/${id}`);
}
