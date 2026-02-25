'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarToggle({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarButtonProps) {
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

function ToolbarButton({
  onClick,
  disabled,
  tooltip,
  children,
}: Omit<ToolbarButtonProps, 'isActive'>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
          aria-label={tooltip}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={5}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-1">
      {/* Text formatting */}
      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        tooltip="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        tooltip="Inline code"
      >
        <Code className="h-4 w-4" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        tooltip="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        tooltip="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        tooltip="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        tooltip="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Block elements */}
      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        tooltip="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip="Horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  className,
  editable = true,
}: RichTextEditorProps) {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
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
    ],
    content,
    editable,
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
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes into the editor
  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const currentContent = editor.getHTML();
    if (content !== currentContent) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

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