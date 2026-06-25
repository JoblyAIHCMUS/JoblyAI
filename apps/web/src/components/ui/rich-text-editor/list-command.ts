import { Extension, type CommandProps, type RawCommands } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

type ListType = 'bulletList' | 'orderedList';

interface ToggleListBlockArgs {
  type: ListType;
  itemType?: string;
}

/**
 * Custom list-toggle command that handles multi-line selections.
 *
 * Branches:
 *   (A) Empty cursor, or selection entirely within a single block:
 *       delegate to Tiptap's built-in `toggleList`. This is the
 *       common "click bullet with cursor in a paragraph" case.
 *   (B) Selection spans N list items: delegate to Tiptap's built-in
 *       `toggleList` (it correctly converts list type or unwraps).
 *   (C) Selection spans N top-level non-list blocks (e.g., N
 *       paragraphs): convert each to a list item, wrap them in a
 *       single new list. This is the fix for the "highlight three
 *       paragraphs, click bullet, get one bullet wrapping three
 *       paragraphs" bug.
 *
 * We do NOT override the built-in `toggleList` (Tiptap's command
 * merger spreads the latest registration, so re-registering the same
 * name shadows the original and any internal call to
 * `commands.toggleList` from within our override would recurse
 * forever).
 *
 * Note on the `as Partial<RawCommands>` cast: `addCommands()` is typed
 * to return `Partial<RawCommands>`, which is a closed type alias
 * built from Tiptap's built-in `Commands` interface. Augmenting that
 * interface works for `chain()`/`commands` call sites but does not
 * propagate into the closed `RawCommands` type alias, so TypeScript
 * rejects the return value even when the augmentation file is
 * present. The cast is the standard Tiptap pattern for custom
 * commands.
 */
export const ListCommand = Extension.create({
  name: 'listCommand',
  addCommands() {
    return {
      toggleListBlock:
        ({ type, itemType = 'listItem' }: ToggleListBlockArgs) =>
        ({ commands, state, tr, dispatch }: CommandProps) => {
          const { from, to, empty } = state.selection;

          // (A) Cursor empty, or selection sits within a single block.
          const sameBlock = state.doc
            .resolve(from)
            .sameParent(state.doc.resolve(to));
          if (empty || sameBlock) {
            return commands.toggleList(type, itemType);
          }

          // Collect every top-level block fully or partially covered by
          // [from, to]. Skip descending into existing lists; branch (B)
          // handles those.
          const blocks: Array<{ node: ProseMirrorNode; pos: number }> = [];
          state.doc.nodesBetween(
            from,
            to,
            (node: ProseMirrorNode, pos: number) => {
              if (!node.isBlock) {
                return false;
              }
              if (
                node.type.name === 'bulletList' ||
                node.type.name === 'orderedList'
              ) {
                return false;
              }
              blocks.push({ node, pos });
              return false;
            }
          );

          // (B) Any block is a list item: built-in toggleList handles
          //     convert/unwrap.
          if (blocks.some((b) => b.node.type.name === 'listItem')) {
            return commands.toggleList(type, itemType);
          }

          // (C) Selection spans N top-level non-list blocks.
          const listType =
            type === 'bulletList'
              ? state.schema.nodes.bulletList
              : state.schema.nodes.orderedList;
          const itemTypeNode = state.schema.nodes[itemType];
          const paraType = state.schema.nodes.paragraph;

          if (!listType || !itemTypeNode || !paraType) {
            return false;
          }

          const items = blocks.map(({ node }) => {
            const para =
              node.type === paraType
                ? node
                : paraType.create(node.attrs, node.content);
            return itemTypeNode.create({}, para);
          });
          const list = listType.create({}, items);

          if (dispatch) {
            tr.replaceWith(from, to, list);
          }
          return true;
        },
    } as Partial<RawCommands>;
  },
});
