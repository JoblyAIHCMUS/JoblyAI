import type { JobDetailContentProps } from '@/types/jobDetail';
import { RichTextContent } from '@/components/ui/rich-text-content';
import { normalizeDescriptionHtml } from '@/lib/utils';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-[28px] lg:text-[32px] font-semibold text-slate-900 leading-tight">
      {children}
    </h2>
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

const IMPORTANCE_GROUPS = [
  { value: 'REQUIRED', label: 'Required', headingClass: 'text-red-700' },
  { value: 'PREFERRED', label: 'Preferred', headingClass: 'text-amber-700' },
  { value: 'OPTIONAL', label: 'Optional', headingClass: 'text-blue-700' },
] as const;

/**
 * Pure presentational component for job detail content.
 * Receives all data as props and renders UI without any business logic or hooks.
 */
export default function JobDetailContent(props: JobDetailContentProps) {
  const { description, formattedSalary, aboutRole, category, requiredSkills } =
    props;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-[72px]">
        <div className="flex flex-col lg:flex-row gap-10 sm:gap-12 lg:gap-[60px] items-start">
          {/* ─── Left Column ─── */}
          <div className="flex flex-col gap-8 sm:gap-10 w-full lg:max-w-[752px]">
            {/* Description */}
            <div className="flex flex-col gap-4">
              <SectionHeading>Description</SectionHeading>
              <RichTextContent html={normalizeDescriptionHtml(description)} />
            </div>
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
                <div className="flex flex-col gap-6">
                  {IMPORTANCE_GROUPS.map((group) => {
                    const items = requiredSkills.filter(
                      (r) => r.importance === group.value
                    );
                    if (items.length === 0) return null;
                    return (
                      <div key={group.value} className="flex flex-col gap-3">
                        <h3
                          className={`text-base font-semibold ${group.headingClass}`}
                        >
                          {group.label} · {items.length}
                        </h3>
                        <div className="flex flex-col gap-2">
                          {items.map((requirement) => (
                            <div
                              key={requirement.skillName}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                              <span className="text-sm sm:text-base font-medium text-slate-900">
                                {requirement.skillName}
                              </span>
                              {requirement.minYearsExperience !== null && (
                                <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                  {requirement.minYearsExperience}+{' '}
                                  {requirement.minYearsExperience === 1
                                    ? 'year'
                                    : 'years'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
