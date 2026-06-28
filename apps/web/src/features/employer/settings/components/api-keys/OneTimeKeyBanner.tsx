'use client';

import { useState } from 'react';
import { Copy, Check, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OneTimeKeyBannerProps {
  apiKey: string;
  onDismiss: () => void;
}

export function OneTimeKeyBanner({ apiKey, onDismiss }: OneTimeKeyBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Degrade gracefully — user can select the text manually.
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-700 shrink-0" />
          <h3 className="label-label-1-semi-bold text-amber-900 text-sm">
            Your new API key
          </h3>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-stretch gap-2 rounded-md border border-amber-300 bg-white p-2.5">
        <code className="flex-1 min-w-0 font-mono text-xs text-[var(--text-primary)] break-all px-2 py-1">
          {apiKey}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 shrink-0 border-amber-300"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-amber-800">
        Copy it now — you won&apos;t see this key again.
      </p>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={onDismiss}
          className="bg-amber-700 text-white hover:bg-amber-800"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
