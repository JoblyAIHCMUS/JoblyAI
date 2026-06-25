import { useRef } from 'react';
import { useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { ListKeymap } from './list-keymap';
import { ListCommand } from './list-command';
import { createMarkdownPasteHandler } from './markdown';
import { cn } from '@/lib/utils';

interface UseRichTextEditorArgs {
  content: string;
  placeholder: string;
}

/**
 * Owns the Tiptap editor instance and the `lastEmittedRef` that the
 * `useContentSync` hook uses to distinguish "parent re-rendered with
 * the value the editor just emitted" from "parent passed a new
 * value". The ref is initialized to an empty string so the first
 * `setContent` (if any) still runs and clears it.
 */
export function useRichTextEditor({
  content,
  placeholder,
}: UseRichTextEditorArgs): {
  editor: Editor | null;
  lastEmittedRef: React.MutableRefObject<string>;
} {
  const lastEmittedRef = useRef<string>('');

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyCurrent: true,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-muted-foreground before:absolute before:top-3 before:left-3 before:pointer-events-none before:opacity-100 before:transition-opacity group-focus-within:before:opacity-0',
      }),
      ListKeymap,
      ListCommand,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'relative prose prose-sm dark:prose-invert max-w-none min-h-[150px] p-3 focus:outline-none',
          '[&_p]:my-0 [&>*:first-child]:mt-0 [&_h2]:mb-2 [&_h3]:mb-1',
          '[&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic'
        ),
      },
      handlePaste: createMarkdownPasteHandler(() => editor ?? null),
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedRef.current = html;
    },
  });

  return { editor, lastEmittedRef };
}
