import type { Editor, ChainedCommands } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';
import { ToolbarToggle } from './toolbar-button';
import { ToolbarGhostButton } from './toolbar-ghost-button';
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

// `toggleListBlock` is a custom command registered by the `ListCommand`
// extension. The augmentation in `tiptap-augment.ts` declares it on
// the `Commands<ReturnType>` interface, but the closed `ChainedCommands`
// type alias used by `editor.chain().focus()` does not pick up
// interface augmentations in this Tiptap build. We type the cast
// explicitly so the `any` lint rule stays quiet and the call site
// remains self-documenting.
type ChainWithToggleListBlock = ChainedCommands & {
  toggleListBlock: (args: {
    type: 'bulletList' | 'orderedList';
    itemType?: string;
  }) => ChainedCommands;
};

function runToggleListBlock(
  editor: Editor,
  args: { type: 'bulletList' | 'orderedList' }
): void {
  (editor.chain().focus() as ChainWithToggleListBlock)
    .toggleListBlock(args)
    .run();
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-1">
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

      <ToolbarToggle
        onClick={() => runToggleListBlock(editor, { type: 'bulletList' })}
        isActive={editor.isActive('bulletList')}
        tooltip="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarToggle
        onClick={() => runToggleListBlock(editor, { type: 'orderedList' })}
        isActive={editor.isActive('orderedList')}
        tooltip="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarToggle
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        tooltip="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarToggle>

      <ToolbarGhostButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip="Horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarGhostButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarGhostButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarGhostButton>

      <ToolbarGhostButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarGhostButton>
    </div>
  );
}
