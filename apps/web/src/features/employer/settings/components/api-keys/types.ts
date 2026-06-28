export interface SupportedClient {
  name: string;
  type: 'CLI';
}

export const SUPPORTED_CLIENTS: SupportedClient[] = [
  { name: 'Claude Code', type: 'CLI' },
  { name: 'Opencode', type: 'CLI' },
  { name: 'Codex', type: 'CLI' },
];
