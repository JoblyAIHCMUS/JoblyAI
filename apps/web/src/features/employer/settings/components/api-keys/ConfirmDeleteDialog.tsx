'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { McpKeyView } from '@/api-client/mcp-keys';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: McpKeyView | null;
  onConfirm: () => Promise<void>;
  deleting?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  apiKey,
  onConfirm,
  deleting,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete API key?</DialogTitle>
          <DialogDescription>
            {apiKey
              ? `Deleting "${apiKey.name}" breaks any client using it. This cannot be undone.`
              : 'This cannot be undone.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
