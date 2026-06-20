import { Input } from '@/components/ui/input';
import { useFormattedNumber } from '@/hooks/useFormattedNumber';

export interface FormattedNumberInputProps {
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
  locale: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputMode?: 'numeric' | 'decimal';
  ariaLabel?: string;
}

export function FormattedNumberInput({
  value,
  onChange,
  locale,
  placeholder = '0',
  disabled = false,
  className,
  inputMode = 'numeric',
  ariaLabel,
}: FormattedNumberInputProps) {
  const { display, inputRef, setFromUserInput } = useFormattedNumber(
    value,
    locale
  );

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode={inputMode}
      value={display}
      onChange={(e) => onChange(setFromUserInput(e.target.value))}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
