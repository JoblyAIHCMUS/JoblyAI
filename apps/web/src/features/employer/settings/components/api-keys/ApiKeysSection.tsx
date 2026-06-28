'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { formatErrorForDisplay } from '@/lib/errors';
import { useListMcpKeys, useCreateMcpKey, useDeleteMcpKey } from '@/api-hook/mcp-keys';
import type {
  McpKeyView,
  CreateMcpKeyResponse,
  McpRole,
} from '@/api-client/mcp-keys';
import { InstallInstructions } from './InstallInstructions';
import { ApiKeyList } from './ApiKeyList';
import { CreateKeyDialog } from './CreateKeyDialog';
import { OneTimeKeyBanner } from './OneTimeKeyBanner';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface ApiKeysSectionProps {
  role: McpRole;
}

export function ApiKeysSection({ role }: ApiKeysSectionProps) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<McpKeyView[]>([]);
  const [newKey, setNewKey] = useState<CreateMcpKeyResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<McpKeyView | null>(null);

  const { fetchMcpKeys, loading: listLoading } = useListMcpKeys({
    onSuccess: setKeys,
    onError: (err) =>
      toast.error(formatErrorForDisplay(err, 'Failed to load API keys')),
  });

  const { createKey, loading: creating } = useCreateMcpKey({
    onError: (err) =>
      toast.error(formatErrorForDisplay(err, 'Failed to create API key')),
  });

  const { removeKey, loading: deleting } = useDeleteMcpKey({
    onError: (err) =>
      toast.error(formatErrorForDisplay(err, 'Failed to delete API key')),
  });

  useEffect(() => {
    fetchMcpKeys().catch(() => {
      // Error handled by onError toast.
    });
  }, []);

  const handleCreate = async (dto: { role: McpRole; name: string }) => {
    try {
      const result = await createKey(dto);
      setNewKey(result);
      setCreateOpen(false);
      toast.success('API key generated');
      await fetchMcpKeys().catch(() => {
        // Silent — refetch failure is non-critical after a successful create.
      });
    } catch {
      // Error handled by toast in useCreateMcpKey hook.
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeKey(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('API key deleted');
      await fetchMcpKeys().catch(() => {
        // Silent — refetch failure is non-critical after a successful delete.
      });
    } catch {
      // Error handled by toast in useDeleteMcpKey hook.
    }
  };

  return (
    <div className="self-stretch flex flex-col gap-6 sm:gap-8 !mt-0 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-1">
      <InstallInstructions />

      <hr className="self-stretch border-[#d6ddeb]" />

      <section className="self-stretch flex flex-col gap-4 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base">
              Your API Keys
            </h2>
            <p className="body-body-1-regular text-[var(--text-tertiary)] text-xs sm:text-sm">
              Manage keys used to authenticate the JoblyAI MCP server.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate new key
          </Button>
        </div>

        {newKey && (
          <OneTimeKeyBanner
            apiKey={newKey.key}
            onDismiss={() => setNewKey(null)}
          />
        )}

        <ApiKeyList
          keys={keys}
          loading={listLoading}
          onDelete={(key) => setDeleteTarget(key)}
        />
      </section>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        role={role}
        onCreate={handleCreate}
        creating={creating}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        apiKey={deleteTarget}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
