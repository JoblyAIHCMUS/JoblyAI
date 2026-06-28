'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { McpRole, CreateMcpKeyDto } from '@/api-client/mcp-keys';

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: McpRole;
  onCreate: (dto: CreateMcpKeyDto) => Promise<void>;
  creating?: boolean;
}

export function CreateKeyDialog({
  open,
  onOpenChange,
  role,
  onCreate,
  creating,
}: CreateKeyDialogProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) setName('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onCreate({ role, name: trimmed });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate new API key</DialogTitle>
          <DialogDescription>
            Create a key to authenticate the JoblyAI MCP server from your AI
            coding agent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mcp-key-name">Key name</Label>
            <Input
              id="mcp-key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cursor work laptop"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mcp-key-role">Role</Label>
            <Input
              id="mcp-key-role"
              value={role}
              disabled
              readOnly
              className="bg-[#f8f9fb] text-[var(--text-secondary)] capitalize"
            />
            <p className="text-xs text-[var(--text-tertiary)]">
              The key is scoped to your account role.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || !name.trim()}>
              {creating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
