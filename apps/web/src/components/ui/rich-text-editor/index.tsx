'use client';

import { useEffect } from 'react';
import { EditorContent, type Editor } from '@tiptap/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useRichTextEditor } from './editor';
import { useContentSync } from './use-content-sync';
import { EditorToolbar } from './toolbar';

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  className,
  editable = true,
}: RichTextEditorProps) {
  const { editor, lastEmittedRef } = useRichTextEditor({
    content,
    placeholder,
  });

  // Skip the editor's own output (controlled-component feedback loop).
  useContentSync(editor, content, lastEmittedRef);

  // Apply `editable` changes after mount; `useEditor` only honors the
  // initial value.
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  // Bridge the editor's `onUpdate` to the parent's `onChange`. We do
  // this here (rather than in `editor.tsx`) so the parent has a
  // stable `onChange` ref to pass without re-creating the editor.
  useEffect(() => {
    if (!editor) {
      return;
    }
    const handler = ({ editor: ed }: { editor: Editor }) => {
      // `lastEmittedRef.current` is already set by the editor's
      // own `onUpdate`. We just hand the value to the parent.
      onChange(ed.getHTML());
    };
    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
    };
  }, [editor, onChange]);

  if (!editor) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'group rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring',
          className
        )}
      >
        {editable && <EditorToolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </TooltipProvider>
  );
}
