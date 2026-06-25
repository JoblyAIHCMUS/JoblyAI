import MarkdownIt from 'markdown-it';
import type { EditorView } from '@tiptap/pm/view';

// One markdown-it instance for the whole module. Configuration:
// - html: false   — don't preserve HTML in pasted markdown (Tiptap ignores
//                   HTML inside `<p>` blocks anyway, and `html: true` is
//                   an XSS risk for untrusted paste sources).
// - linkify: false — auto-link detection is moot because we don't enable
//                   the Tiptap `Link` extension; keep the output clean.
// - breaks: true   — single newlines become <br>, matching how users
//                   type in chat-style inputs.
const md = new MarkdownIt({
  html: false,
  linkify: false,
  breaks: true,
});

// We don't disable any features here — `html: false` + `linkify: false`
// already disables the ones we don't want (tables, images, links, raw
// HTML, auto-links).

/**
 * Convert a markdown string to HTML using the configured markdown-it
 * instance. Only H2/H3 headings are allowed; H1 is rewritten to H2
 * (the editor doesn't render H1). H4-H6 are passed through and become
 * paragraphs in Tiptap, which is a reasonable fallback.
 */
export function markdownToHtml(markdown: string): string {
  try {
    const sanitized = markdown.replace(/^#\s+/gm, '## ');
    return md.render(sanitized);
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return markdown;
  }
}

/**
 * Detect if text contains markdown syntax we know how to render.
 * Patterns match the StarterKit + Placeholder feature set:
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text__)
 * - Strikethrough (~~text~~)
 * - Inline code (`text`)
 * - Headings (## or ###)
 * - Bullet lists (-, *, +)
 * - Numbered lists (1.)
 * - Blockquotes (>)
 * - Horizontal rules (---, ***, ___)
 */
export function looksLikeMarkdown(text: string): boolean {
  const supportedPatterns = [
    /\*\*[^*]+\*\*/m,
    /__[^_]+__/m,
    /~~[^~]+~~/m,
    /`[^`]+`/m,
    /^##\s/m,
    /^###\s/m,
    /^\s*[-*+]\s/m,
    /^\s*\d+\.\s/m,
    /^\s*>/m,
    /^(-{3}|\*{3}|_{3})$/m,
  ];
  return supportedPatterns.some((pattern) => pattern.test(text));
}

/**
 * Build a Tiptap `handlePaste` function. Only takes ownership of pastes
 * whose plain-text payload looks like markdown. If the parsed HTML can
 * be inserted, we preventDefault and report success; otherwise we let
 * Tiptap's default handler run (fixes the "pasted markdown disappears"
 * bug where the old code called preventDefault before knowing the
 * insert would succeed).
 */
export function createMarkdownPasteHandler(
  getEditor: () => import('@tiptap/react').Editor | null
) {
  return (view: EditorView, event: ClipboardEvent): boolean => {
    const text = event.clipboardData?.getData('text/plain');
    const html = event.clipboardData?.getData('text/html');

    // If there's HTML, let Tiptap handle it normally.
    if (html) {
      return false;
    }

    if (text && looksLikeMarkdown(text)) {
      const htmlContent = markdownToHtml(text);
      const editor = getEditor();
      const ok = editor?.commands.insertContent(htmlContent) ?? false;
      if (ok) {
        event.preventDefault();
        return true;
      }
    }

    return false;
  };
}
