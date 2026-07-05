'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PreShortlistInfoModal,
  type PreShortlistInfoKind,
} from './PreShortlistInfoModal';

interface PreShortlistInfoButtonProps {
  kind: PreShortlistInfoKind;
}

export function PreShortlistInfoButton({ kind }: PreShortlistInfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipText =
    kind === 'generate'
      ? 'Learn how the generation prompt works'
      : 'Learn how the evaluation prompt works';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={tooltipText}
            onClick={() => setIsOpen(true)}
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>

      <PreShortlistInfoModal
        kind={kind}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </TooltipProvider>
  );
}
