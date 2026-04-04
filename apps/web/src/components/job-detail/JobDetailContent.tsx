import { CheckCircle2 } from 'lucide-react';
import type { JobDetailContentProps } from '@/types/jobDetail';

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
      <p className="text-sm sm:text-base leading-6 text-slate-900">{text}</p>
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

function SkillTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-indigo-50 text-indigo-700 px-2.5 sm:px-3 py-1 rounded-[2px] text-xs sm:text-sm lg:text-base font-normal">
      {children}
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
              <p className="text-sm sm:text-base leading-6 text-slate-500">
                {descriptionContent.overview}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="flex flex-col gap-4">
              <SectionHeading>Responsibilities</SectionHeading>
              <div className="flex flex-col gap-2">
                {descriptionContent.responsibilities.map((item) => (
                  <CheckItem key={item} text={item} />
                ))}
              </div>
            </div>

            {/* Who You Are */}
            <div className="flex flex-col gap-4">
              <SectionHeading>Who You Are</SectionHeading>
              <div className="flex flex-col gap-2">
                {descriptionContent.whoYouAre.map((item) => (
                  <CheckItem key={item} text={item} />
                ))}
              </div>
            </div>

            {/* Nice-To-Haves */}
            <div className="flex flex-col gap-4">
              <SectionHeading>Nice-To-Haves</SectionHeading>
              <div className="flex flex-col gap-2">
                {descriptionContent.niceToHaves.map((item) => (
                  <CheckItem key={item} text={item} />
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right Column ─── */}
          <div className="flex flex-col gap-8 sm:gap-10 w-full lg:flex-1 min-w-0">
            {/* About This Role */}
            <div className="flex flex-col gap-6">
              <SectionHeading>About this role</SectionHeading>

              {/* Progress bar */}
              <div className="flex flex-col gap-2 py-3">
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
              </div>

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
            <div className="flex flex-col gap-4">
              <SectionHeading>Required Skills</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <SkillTag key={skill}>{skill}</SkillTag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
