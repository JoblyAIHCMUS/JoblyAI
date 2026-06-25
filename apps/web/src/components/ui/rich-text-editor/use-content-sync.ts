import { useEffect, type MutableRefObject } from 'react';
import type { Editor } from '@tiptap/react';

/**
 * Sync the external `content` prop into the editor without clobbering
 * undo history or the cursor.
 *
 * The trick: a controlled Tiptap editor's `onUpdate` callback hands
 * HTML back to the parent, the parent typically stores it in form
 * state, and then re-passes it as `content` on the next render. If we
 * naively call `setContent` on every render, we reset the editor's
 * undo history and move the cursor to the start.
 *
 * Solution: in the editor's `onUpdate`, the caller sets
 * `lastEmittedRef.current = editor.getHTML()` BEFORE calling
 * `onChange`. This hook compares the incoming `content` prop against
 * that ref. If they match, the value is the editor's own output — the
 * feedback loop — and we skip the sync.
 *
 * Genuine external changes (e.g., a form reset) will pass a value
 * that doesn't match `lastEmittedRef.current`, so we call
 * `setContent(content, { emitUpdate: false })` and clear
 * `lastEmittedRef.current` so the next user-typed update isn't
 * misattributed.
 */
export function useContentSync(
  editor: Editor | null,
  content: string,
  lastEmittedRef: MutableRefObject<string>
): void {
  useEffect(() => {
    if (!editor) {
      return;
    }
    if (content === lastEmittedRef.current) {
      return;
    }
    const current = editor.getHTML();
    if (content === current) {
      return;
    }
    editor.commands.setContent(content, { emitUpdate: false });
    lastEmittedRef.current = '';
  }, [content, editor, lastEmittedRef]);
}
