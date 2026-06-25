import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolbarToggleProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

export function ToolbarToggle({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={onClick}
          disabled={disabled}
          aria-label={tooltip}
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={5}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
