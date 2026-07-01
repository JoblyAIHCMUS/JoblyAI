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
import { MatchExplanationDrawer } from './matchExplanationDrawer';

interface MatchExplanationButtonProps {
  applicationId: string | number;
  score: number | null;
}

export function MatchExplanationButton({
  applicationId,
  score,
}: MatchExplanationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!score && score !== 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View match analysis</p>
        </TooltipContent>
      </Tooltip>

      <MatchExplanationDrawer
        applicationId={applicationId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </TooltipProvider>
  );
}
