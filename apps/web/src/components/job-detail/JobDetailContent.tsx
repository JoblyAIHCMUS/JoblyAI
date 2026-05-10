import { CheckCircle2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { JobDetailContentProps } from '@/types/jobDetail';

function CheckItem({ text }: { text: string }) {
  // Handle both plain text and HTML content from editor
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['strong', 'em', 'u', 's', 'code', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  const isHtml = sanitized !== text || text.includes('<');

  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
      {isHtml ? (
        <p
          className="text-sm sm:text-base leading-6 text-slate-900 [&_a]:text-indigo-600 [&_a]:hover:underline"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      ) : (
        <p className="text-sm sm:text-base leading-6 text-slate-900">{text}</p>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-[28px] lg:text-[32px] font-semibold text-slate-900 leading-tight">
      {children}
    </h2>
  );
}

function RequirementStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    REQUIRED: 'bg-red-100 text-red-700',
    PREFERRED: 'bg-amber-100 text-amber-700',
    OPTIONAL: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        colors[status] || colors.OPTIONAL
      }`}
    >
      {status}
    </span>
  );
}

function CategoryPill({
  children,
  color,
}: {
  children: React.ReactNode;
  color: 'orange' | 'teal';
}) {
  return (
    <span
      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
        color === 'orange'
          ? 'bg-orange-100 text-orange-500'
          : 'bg-teal-100 text-teal-500'
      }`}
    >
      {children}
    </span>
  );
}

function RichDescriptionContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'h1',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });

  return (
    <div
      className="prose prose-sm sm:prose-base max-w-none text-slate-500 [&_p]:leading-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:mt-7 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-3 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-slate-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-indigo-600 [&_a]:hover:underline [&_a]:break-words [&_span]:inline"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

/**
 * Renders content that can be either plain text list items or rich HTML.
 * Supports both legacy (string[]) and modern (string/HTML) formats.
 */
function RichContentSection({ content }: { content: string[] | string }) {
  // If content is a string (HTML), render it as rich content
  if (typeof content === 'string') {
    return <RichDescriptionContent html={content} />;
  }

  // If content is an array, render each item with CheckItem
  return (
    <div className="flex flex-col gap-2">
      {content.map((item) => (
        <CheckItem key={item} text={item} />
      ))}
    </div>
  );
}

/**
 * Pure presentational component for job detail content.
 * Receives all data as props and renders UI without any business logic or hooks.
 */
export default function JobDetailContent(props: JobDetailContentProps) {
  const {
    descriptionContent,
    applicationProgress,
    formattedSalary,
    aboutRole,
    category,
    requiredSkills,
  } = props;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-[72px]">
        <div className="flex flex-col lg:flex-row gap-10 sm:gap-12 lg:gap-[60px] items-start">
          {/* ─── Left Column ─── */}
          <div className="flex flex-col gap-8 sm:gap-10 w-full lg:max-w-[752px]">
            {/* Description */}
            <div className="flex flex-col gap-4">
              <SectionHeading>Description</SectionHeading>
              <RichDescriptionContent html={descriptionContent.overview} />
            </div>

            {/* Responsibilities */}
            {descriptionContent.responsibilities &&
              (Array.isArray(descriptionContent.responsibilities)
                ? descriptionContent.responsibilities.length > 0
                : descriptionContent.responsibilities) && (
                <div className="flex flex-col gap-4">
                  <SectionHeading>Responsibilities</SectionHeading>
                  <RichContentSection
                    content={descriptionContent.responsibilities}
                  />
                </div>
              )}

            {/* Who You Are */}
            {descriptionContent.whoYouAre &&
              (Array.isArray(descriptionContent.whoYouAre)
                ? descriptionContent.whoYouAre.length > 0
                : descriptionContent.whoYouAre) && (
                <div className="flex flex-col gap-4">
                  <SectionHeading>Who You Are</SectionHeading>
                  <RichContentSection content={descriptionContent.whoYouAre} />
                </div>
              )}

            {/* Nice-To-Haves */}
            {descriptionContent.niceToHaves &&
              (Array.isArray(descriptionContent.niceToHaves)
                ? descriptionContent.niceToHaves.length > 0
                : descriptionContent.niceToHaves) && (
                <div className="flex flex-col gap-4">
                  <SectionHeading>Nice-To-Haves</SectionHeading>
                  <RichContentSection
                    content={descriptionContent.niceToHaves}
                  />
                </div>
              )}
          </div>

          {/* ─── Right Column ─── */}
          <div className="flex flex-col gap-8 sm:gap-10 w-full lg:flex-1 min-w-0">
            {/* About This Role */}
            <div className="flex flex-col gap-6">
              <SectionHeading>About this role</SectionHeading>

              {/* Progress bar */}
              {/* <div className="flex flex-col gap-2 py-3">
                <p className="text-sm sm:text-base text-slate-900">
                  <span className="font-medium">
                    {aboutRole.appliedCount} applied
                  </span>{' '}
                  <span className="text-slate-500">
                    of {aboutRole.capacity} capacity
                  </span>
                </p>
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: applicationProgress }}
                  />
                </div>
              </div> */}

              {/* Meta rows */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-900">
                    Apply Before
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#25324B]">
                    {aboutRole.applyBefore}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-900">
                    Job Posted On
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#25324B]">
                    {aboutRole.postedOn}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-900">
                    Job Type
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#25324B]">
                    {aboutRole.jobType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-900">
                    Salary
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#202430]">
                    {formattedSalary}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Categories */}
            <div className="flex flex-col gap-6">
              <SectionHeading>Category</SectionHeading>
              <div className="flex flex-wrap gap-2">
                <CategoryPill color={category.color}>
                  {category.label}
                </CategoryPill>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Required Skills */}
            {requiredSkills.length > 0 && (
              <div className="flex flex-col gap-4">
                <SectionHeading>Required Skills</SectionHeading>
                <div className="flex flex-col gap-3">
                  {requiredSkills.map((requirement) => (
                    <div
                      key={requirement.skillName}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm sm:text-base font-medium text-slate-900">
                        {requirement.skillName}
                      </span>
                      <div className="flex items-center gap-2">
                        {requirement.minYearsExperience !== null && (
                          <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {requirement.minYearsExperience}+{' '}
                            {requirement.minYearsExperience === 1
                              ? 'year'
                              : 'years'}
                          </span>
                        )}
                        <RequirementStatusBadge
                          status={requirement.importance}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
