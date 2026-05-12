import DOMPurify from 'dompurify';

interface CompanyProfileAboutProps {
  description: string;
}

export function CompanyProfileAbout({ description }: CompanyProfileAboutProps) {
  return (
    <div
      className="prose prose-slate max-w-none prose-h2:text-xl sm:prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-2 sm:prose-h2:mb-3 prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 sm:prose-h3:mt-6 prose-h3:mb-1 sm:prose-h3:mb-2 prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-5 prose-li:my-0.5 sm:prose-li:my-1 prose-p:my-2 sm:prose-p:my-3 prose-blockquote:border-l-4 prose-blockquote:pl-3 sm:prose-blockquote:pl-4 prose-blockquote:italic prose-sm sm:prose-base"
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
