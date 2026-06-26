import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

export const RICH_TEXT_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  's',
  'code',
  'pre',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'hr',
] as const;

export const RICH_TEXT_ALLOWED_ATTR = ['class'] as const;

export function RichTextContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const sanitized = DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS: [...RICH_TEXT_ALLOWED_TAGS],
    ALLOWED_ATTR: [...RICH_TEXT_ALLOWED_ATTR],
  });

  return (
    <div
      className={cn(
        'prose prose-sm sm:prose-base max-w-none text-slate-500',
        '[&_p]:leading-6',
        '[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3',
        '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-3',
        '[&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4',
        '[&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
        '[&_pre]:bg-slate-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
