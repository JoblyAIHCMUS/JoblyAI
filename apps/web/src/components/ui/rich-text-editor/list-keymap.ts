import { Extension } from '@tiptap/core';

/**
 * Adds three keyboard shortcuts that improve list ergonomics:
 *
 *   Tab        — when inside a list item, indent it (sink).
 *   Shift+Tab  — when inside a list item, outdent it (lift).
 *   Enter      — when on an empty list item, lift out of the list.
 *                (Tiptap's default `splitListItem` already does this
 *                when `liftOnEmpty: true`; this is an explicit safety
 *                net against future keymap overrides.)
 *
 * Outside a list, all three handlers return `false` so the default
 * Tiptap behavior runs (paragraph break on Enter, etc.).
 */
export const ListKeymap = Extension.create({
  name: 'listKeymap',
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.sinkListItem('listItem');
        }
        return false;
      },
      'Shift-Tab': () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.liftListItem('listItem');
        }
        return false;
      },
      Enter: () => {
        const { $from } = this.editor.state.selection;
        if (
          this.editor.isActive('listItem') &&
          $from.parent.content.size === 0
        ) {
          return this.editor.commands.liftListItem('listItem');
        }
        return false;
      },
    };
  },
});
