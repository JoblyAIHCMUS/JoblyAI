import { useRef, type RefObject } from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect';
import {
  computeCaretAfterFormat,
  formatSalaryNumber,
} from '@/lib/currency-format';

const MAX_DIGITS = 15;

export function useFormattedNumber(
  value: number | undefined,
  locale: string
): {
  display: string;
  inputRef: RefObject<HTMLInputElement | null>;
  setFromUserInput: (text: string) => number | undefined;
} {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaret = useRef<{ caret: number; prev: string } | null>(null);

  const display = formatSalaryNumber(value, locale);

  useIsomorphicLayoutEffect(() => {
    const p = pendingCaret.current;
    if (!p || !inputRef.current) return;
    const next = computeCaretAfterFormat(p.prev, p.caret, display);
    inputRef.current.setSelectionRange(next, next);
    pendingCaret.current = null;
  }, [display]);

  const setFromUserInput = (text: string): number | undefined => {
    if (inputRef.current) {
      pendingCaret.current = {
        caret: inputRef.current.selectionStart ?? text.length,
        prev: text,
      };
    }
    const digits = text.replace(/\D/g, '').slice(0, MAX_DIGITS);
    if (digits === '') return undefined;
    return parseInt(digits, 10);
  };

  return { display, inputRef, setFromUserInput };
}
