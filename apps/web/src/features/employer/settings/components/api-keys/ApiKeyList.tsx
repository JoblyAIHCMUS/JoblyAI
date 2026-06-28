'use client';

import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { McpKeyView } from '@/api-client/mcp-keys';

interface ApiKeyListProps {
  keys: McpKeyView[];
  onDelete: (key: McpKeyView) => void;
  loading?: boolean;
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function maskKey(prefix: string): string {
  if (!prefix) return '••••';
  return `${prefix}••••`;
}

export function ApiKeyList({ keys, onDelete, loading }: ApiKeyListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5]" />
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="body-body-1-regular text-[var(--text-tertiary)] text-sm">
          No API keys yet
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#d6ddeb]">
            <th className="py-2 pr-4 label-label-2-medium text-[var(--text-tertiary)] text-xs font-medium">
              Name
            </th>
            <th className="py-2 pr-4 label-label-2-medium text-[var(--text-tertiary)] text-xs font-medium">
              Key
            </th>
            <th className="py-2 pr-4 label-label-2-medium text-[var(--text-tertiary)] text-xs font-medium">
              Role
            </th>
            <th className="py-2 pr-4 label-label-2-medium text-[var(--text-tertiary)] text-xs font-medium">
              Created
            </th>
            <th className="py-2 pr-4 label-label-2-medium text-[var(--text-tertiary)] text-xs font-medium">
              Last used
            </th>
            <th className="py-2 pr-0 label-label-2-medium text-[var(--text-tertiary)] text-xs font-medium text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.id} className="border-b border-[#eef0f4]">
              <td className="py-3 pr-4 body-body-1-regular text-[var(--text-primary)] text-sm">
                {key.name}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-[var(--text-secondary)]">
                {maskKey(key.prefix)}
              </td>
              <td className="py-3 pr-4">
                {key.role && (
                  <Badge variant="secondary" className="text-[10px]">
                    {key.role}
                  </Badge>
                )}
              </td>
              <td className="py-3 pr-4 body-body-1-regular text-[var(--text-secondary)] text-xs">
                {formatRelativeDate(key.createdAt)}
              </td>
              <td className="py-3 pr-4 body-body-1-regular text-[var(--text-secondary)] text-xs">
                {formatRelativeDate(key.lastRequest)}
              </td>
              <td className="py-3 pr-0 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(key)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#ff6550] hover:bg-red-50 transition-colors"
                  aria-label={`Delete key ${key.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
