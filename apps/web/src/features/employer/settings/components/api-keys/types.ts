export interface SupportedClient {
  name: string;
  type: 'CLI';
  flag: string;
}

export const SUPPORTED_CLIENTS: SupportedClient[] = [
  { name: 'Claude Code', type: 'CLI', flag: '--claude' },
  { name: 'Opencode', type: 'CLI', flag: '--opencode' },
  { name: 'Codex', type: 'CLI', flag: '--codex' },
];

/**
 * Builds the install command for a given selection. Flags are emitted in
 * SUPPORTED_CLIENTS order (deterministic), independent of click order.
 * Empty selection -> bare 'npx jobly-mcp' (a valid command).
 */
export function buildInstallCommand(selected: Set<string>): string {
  const flags = SUPPORTED_CLIENTS.filter((c) => selected.has(c.flag)).map(
    (c) => c.flag,
  );
  return ['npx jobly-mcp', ...flags].join(' ');
}
