import DOMPurify from 'dompurify';

interface CompanyProfileAboutProps {
  description: string;
}

export function CompanyProfileAbout({ description }: CompanyProfileAboutProps) {
  return (
    <div
      className="prose prose-slate max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1 prose-p:my-3 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(description, {
          ALLOWED_TAGS: [
            'h2',
            'h3',
            'p',
            'br',
            'hr',
            'ul',
            'ol',
            'li',
            'strong',
            'b',
            'em',
            'i',
            's',
            'del',
            'blockquote',
            'code',
            'pre',
          ],
          ALLOWED_ATTR: [],
        }),
      }}
    />
  );
}
