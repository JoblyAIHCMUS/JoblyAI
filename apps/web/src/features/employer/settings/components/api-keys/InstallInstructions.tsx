'use client';

import { useMemo, useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUPPORTED_CLIENTS, buildInstallCommand } from './types';

export function InstallInstructions() {
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const command = useMemo(() => buildInstallCommand(selected), [selected]);

  const toggleClient = (flag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) {
        next.delete(flag);
      } else {
        next.add(flag);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Degrade gracefully — user can select the text manually.
    }
  };

  return (
    <section className="self-stretch flex flex-col gap-4 sm:gap-5 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="heading-h6-semi-bold sm:heading-h5-semi-bold text-[var(--text-primary)] text-sm sm:text-base">
          Connect JoblyAI to your AI coding agent
        </h2>
        <p className="body-body-1-regular text-[var(--text-tertiary)] text-xs sm:text-sm">
          Generate an API key below, then run the setup command.
        </p>
      </div>

      <hr className="self-stretch border-[#d6ddeb]" />

      <div className="flex flex-col gap-2">
        <div className="flex items-stretch gap-2 rounded-md border border-[#d6ddeb] bg-[#f8f9fb] p-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Terminal className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
            <code className="font-mono text-xs sm:text-sm text-[var(--text-primary)] truncate">
              {command}
            </code>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 shrink-0"
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
        <p className="body-body-1-regular text-[var(--text-tertiary)] text-xs">
          The CLI will prompt you to paste your API key.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="label-label-1-semi-bold text-[var(--text-primary)] text-xs sm:text-sm">
          Supported clients
        </h3>
        <ul className="flex flex-col gap-1.5">
          {SUPPORTED_CLIENTS.map((client) => {
            const isSelected = selected.has(client.flag);
            return (
              <li key={client.name}>
                <button
                  type="button"
                  onClick={() => toggleClient(client.flag)}
                  aria-pressed={isSelected}
                  className={[
                    'flex w-full items-center justify-between rounded-md border px-3 py-2 transition-colors cursor-pointer',
                    isSelected
                      ? 'border-[color:var(--border-accent-primary)] bg-[color:var(--bg-accent-primary)]'
                      : 'border-[#d6ddeb] hover:bg-[#f8f9fb]',
                  ].join(' ')}
                >
                  <span className="body-body-1-regular text-[var(--text-primary)] text-xs sm:text-sm">
                    {client.name}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-[#d6ddeb] bg-[#f8f9fb] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                    {client.type}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
