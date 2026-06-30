'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import {
  SkillTagsManager,
  type SkillImportance,
} from '@/components/employer/skillTagsManager';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/components/ui/stepper';
import { useJobDetail } from '@/api-hook/jobs';
import { useUpdateJob } from '@/api-hook/jobs';
import { useCategories } from '@/api-hook/jobs';
import { useSkillIds } from '@/api-hook/skills';
import {
  usePreShortlistQuestionsForJob,
} from '@/api-hook/pre-shortlist';
import { PreShortlistStep } from '../../new-job/components/PreShortlistStep';
import { jobPostingSchema, type JobPostingFormData } from './schema';
import type { EmploymentType, RequirementImportance } from '@/api-client/jobs';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/lib/employment-type-config';
import {
  currencySymbol,
  currencyToLocale,
  type CurrencyCode,
} from '@/lib/currency-format';

const EDIT_JOB_STEPS = [
  { id: 'basic-info', label: 'Basic Information' },
  { id: 'description', label: 'Job Description' },
  { id: 'pre-shortlist', label: 'Pre-Shortlist Questions' },
] as const;

const CURRENCIES = [
  { value: 'none', label: 'None' },
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
  { value: 'gbp', label: 'GBP' },
  { value: 'vnd', label: 'VND' },
  { value: 'jpy', label: 'JPY' },
  { value: 'cny', label: 'CNY' },
] as const;

// Helper to check if HTML content has actual text (not just empty tags like <p></p>)
const isHtmlContentEmpty = (html: string): boolean => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text === '';
};

// Helper to convert SkillImportance to RequirementImportance
const convertToRequirementImportance = (
  importance: SkillImportance
): RequirementImportance => {
  if (importance === 'OPTIONAL') {
    return 'OPTIONAL';
  }
  return importance as RequirementImportance;
};

export default function JobListingEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = parseInt(id, 10);

  // API hooks
  const { fetchJobDetail, data: jobData, loading: jobLoading } = useJobDetail();
  const { categories, loading: categoriesLoading } = useCategories();
  const { submitUpdate, loading: submitLoading } = useUpdateJob({
    onSuccess: () => {
      toast.success('Job updated successfully!');
      router.replace('/employer/job-listing');
    },
    onError: () => {
      toast.error('Failed to update job. Please try again.');
    },
  });
  const { getOrCreateSkills, loading: skillsLoading } = useSkillIds();
  const { data: preShortlistData, loading: preShortlistLoading } =
    usePreShortlistQuestionsForJob(jobId);

  // Form setup
  const methods = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      type: 'FULL_TIME' as const,
      remote: false,
      location: '',
      categoryId: '',
      currency: 'none' as const,
      salaryMin: undefined,
      salaryMax: undefined,
      skills: [],
      preShortlistThreshold: 0,
      preShortlistQuestions: [],
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = methods;

  // Watch fields
  const remote = watch('remote');
  const currency = watch('currency');
  const description = watch('description');
  const skills = watch('skills');
  const type = watch('type');
  const categoryId = watch('categoryId');
  const salaryMin = watch('salaryMin');
  const salaryMax = watch('salaryMax');

  // Fetch job data on mount and when jobId changes
  useEffect(() => {
    fetchJobDetail(jobId);
  }, [jobId, fetchJobDetail]);

  // Populate form once job data, pre-shortlist questions, and categories are all ready
  useEffect(() => {
    if (!jobData || preShortlistData === null || categoriesLoading) return;
    reset({
      title: jobData.title,
      description: jobData.description,
      type: jobData.type,
      remote: jobData.remote,
      location: jobData.location || '',
      categoryId: String(jobData.category.id),
      currency: (jobData.currency
        ? jobData.currency.toLowerCase()
        : 'none') as CurrencyCode,
      salaryMin: jobData.salaryMin ?? undefined,
      salaryMax: jobData.salaryMax ?? undefined,
      skills: (jobData.requirements || []).map((req) => ({
        name: req.skillName,
        importance: req.importance as SkillImportance,
        minYearsExperience: req.minYearsExperience ?? undefined,
      })),
      preShortlistThreshold:
        preShortlistData.threshold ?? jobData.preShortlistThreshold ?? 0,
      preShortlistQuestions: (preShortlistData.questions || [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((q) => ({
          question: q.question,
          expectedAnswer: q.expectedAnswer ?? '',
        })),
    });
  }, [jobData, preShortlistData, categoriesLoading, reset]);

  if (jobLoading || !jobData || preShortlistData === null) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Loading job...
        </h1>
      </div>
    );
  }

  // Validation for each step
  const canProceed = (stepIndex: number): boolean => {
    const currentValues = getValues();
    switch (stepIndex) {
      case 0: // Basic Information
        return (
          !!currentValues.title &&
          currentValues.title.trim().length >= 2 &&
          !!currentValues.type &&
          !!currentValues.categoryId &&
          !errors.title &&
          !errors.type &&
          !errors.categoryId &&
          !errors.salaryMin &&
          !errors.salaryMax
        );
      case 1: // Job Description
        return !errors.description && !isHtmlContentEmpty(description);
      case 2: // Pre-Shortlist (read-only; threshold already validated)
        return !errors.preShortlistThreshold;
      default:
        return true;
    }
  };

  const handleCurrencyChange = (value: string) => {
    setValue('currency', value as CurrencyCode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (value === 'none') {
      setValue('salaryMin', undefined, { shouldValidate: true });
      setValue('salaryMax', undefined, { shouldValidate: true });
    }
  };

  const handleComplete = async (data: JobPostingFormData) => {
    try {
      // Resolve skill IDs (create if needed)
      let requirements = undefined;
      if (data.skills && data.skills.length > 0) {
        const skillObjs = await getOrCreateSkills(
          data.skills.map((s) => s.name)
        );
        requirements = data.skills.map((s) => {
          const skillObj = skillObjs.find(
            (obj) => obj.name.toLowerCase() === s.name.toLowerCase()
          );
          return {
            skillId: skillObj ? skillObj.id : 0,
            importance: convertToRequirementImportance(s.importance),
            minYearsExperience: s.minYearsExperience || 0,
          };
        });
      }

      // Build payload
      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        remote: data.remote,
        location: data.remote ? undefined : data.location,
        categoryId: Number(data.categoryId),
        currency:
          data.currency === 'none' ? undefined : data.currency.toUpperCase(),
        salaryMin: data.salaryMin ?? undefined,
        salaryMax: data.salaryMax ?? undefined,
        requirements,
        preShortlistThreshold: data.preShortlistThreshold,
      };

      await submitUpdate(jobId, payload);
    } catch (err) {
      console.error('Failed to update job:', err);
    }
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-6">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-0.5"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        </button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Edit Job</h1>
      </div>
      <p className="body-body-1-regular text-slate-600 mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base">
        Update the details for <strong>{jobData.title}</strong>.
      </p>

      <FormProvider {...methods}>
        <Stepper
          steps={EDIT_JOB_STEPS}
          canProceed={canProceed}
          onComplete={handleSubmit(handleComplete)}
          loading={
            submitLoading ||
            skillsLoading ||
            categoriesLoading ||
            preShortlistLoading
          }
        >
          {/* Step 1: Basic Information */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-2xl mx-auto px-3 sm:px-0">
            {/* Job Title */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
              <div className="pt-0 md:pt-3">
                <Label
                  htmlFor="title"
                  className="label-label-1-semibold text-sm sm:text-base"
                >
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  Be specific - this is the first thing candidates see.
                </p>
              </div>
              <div className="space-y-1">
                <Input
                  id="title"
                  placeholder="e.g. Software Engineer"
                  className={`h-10 sm:h-12 text-sm sm:text-base ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs sm:text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Type of Employment */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
              <div className="pt-0 md:pt-3">
                <Label className="label-label-1-semibold text-sm sm:text-base">
                  Type of employment <span className="text-red-500">*</span>
                </Label>
                {errors.type && (
                  <p className="text-xs sm:text-sm text-red-500 mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>
              <RadioGroup
                value={type}
                onValueChange={(value) =>
                  setValue('type', value as EmploymentType)
                }
                className="flex flex-wrap gap-2 sm:gap-4"
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                  <div
                    key={t.value}
                    className="flex items-center space-x-1.5 sm:space-x-2"
                  >
                    <RadioGroupItem value={t.value} id={t.value} />
                    <Label
                      htmlFor={t.value}
                      className="font-normal cursor-pointer text-xs sm:text-sm"
                    >
                      {t.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
              <div className="pt-0 md:pt-3">
                <Label
                  htmlFor="location"
                  className="label-label-1-semibold text-sm sm:text-base"
                >
                  Location
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  Where is the job based?
                </p>
              </div>
              <div className="grid grid-rows-[auto_auto] gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Input
                    id="location"
                    placeholder="e.g. 123 This Street, That Town, The Other Country"
                    disabled={remote}
                    className={`h-10 sm:h-12 text-sm sm:text-base ${
                      errors.location ? 'border-red-500' : ''
                    }`}
                    {...register('location')}
                  />
                  {errors.location && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.location.message}
                    </p>
                  )}
                </div>
                {/* Remote Work */}
                <div className="flex items-center gap-2 sm:gap-3 pt-1">
                  <Switch
                    id="remote"
                    className="data-[state=checked]:bg-black"
                    checked={remote}
                    onCheckedChange={(checked) => {
                      setValue('remote', checked);
                      if (checked) setValue('location', '');
                    }}
                  />
                  <Label
                    htmlFor="remote"
                    className="font-normal cursor-pointer text-xs sm:text-sm"
                  >
                    This is a remote position
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
              <div className="pt-0 md:pt-3">
                <Label className="label-label-1-semibold text-sm sm:text-base">
                  Category <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="space-y-1">
                <Select
                  value={categoryId}
                  onValueChange={(value: string) =>
                    setValue('categoryId', value)
                  }
                >
                  <SelectTrigger
                    className={`h-10 sm:h-12 text-sm sm:text-base ${
                      errors.categoryId ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs sm:text-sm text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Required Skills */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
              <div className="pt-0 md:pt-3">
                <Label className="label-label-1-semibold text-sm sm:text-base">
                  Required Skills
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  Skills useful for the job (Optional)
                </p>
              </div>
              <SkillTagsManager
                skills={skills}
                onChange={(newSkills) => {
                  const normalizedSkills = newSkills.map((skill) => ({
                    ...skill,
                    minYearsExperience: (skill.minYearsExperience ??
                      0) as number,
                  }));
                  setValue('skills', normalizedSkills);
                }}
              />
            </div>

            <Separator />

            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
              <div className="pt-0 md:pt-3">
                <Label className="label-label-1-semibold text-sm sm:text-base">
                  Salary
                </Label>
                <p className="text-xs text-slate-500 mt-1">Optional</p>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="h-10 sm:h-12 w-full sm:w-[100px] text-xs sm:text-sm">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currency !== 'none' && (
                    <>
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs sm:text-sm text-slate-500">
                          {currencySymbol(currency)}
                        </span>
                        <FormattedNumberInput
                          value={salaryMin}
                          onChange={(n) =>
                            setValue('salaryMin', n, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          locale={currencyToLocale(currency)}
                          placeholder="Min"
                          ariaLabel="Minimum salary"
                          className={`h-10 sm:h-12 text-xs sm:text-sm flex-1 ${
                            errors.salaryMin ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500">
                        to
                      </span>
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs sm:text-sm text-slate-500">
                          {currencySymbol(currency)}
                        </span>
                        <FormattedNumberInput
                          value={salaryMax}
                          onChange={(n) =>
                            setValue('salaryMax', n, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          locale={currencyToLocale(currency)}
                          placeholder="Max"
                          ariaLabel="Maximum salary"
                          className={`h-10 sm:h-12 text-xs sm:text-sm flex-1 ${
                            errors.salaryMax ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                    </>
                  )}
                </div>
                {currency !== 'none' && (
                  <p className="text-xs text-slate-500">per month</p>
                )}
                {currency !== 'none' &&
                  (errors.salaryMin || errors.salaryMax) && (
                    <div className="space-y-1">
                      {errors.salaryMin && (
                        <p className="text-xs sm:text-sm text-red-500">
                          {errors.salaryMin.message}
                        </p>
                      )}
                      {errors.salaryMax && (
                        <p className="text-xs sm:text-sm text-red-500">
                          {errors.salaryMax.message}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Step 2: Job Description */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-3xl mx-auto px-3 sm:px-0">
            <div className="space-y-2 sm:space-y-3">
              <Label className="label-label-1-semibold text-sm sm:text-base">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                content={description}
                onChange={(content) => setValue('description', content)}
                placeholder="Describe the role, key responsibilities, required skills, qualifications, what we offer, and any other important information..."
                className={`min-h-[240px] sm:min-h-[320px] md:min-h-[360px] ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="text-xs sm:text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Step 3: Pre-Shortlist (read-only) */}
          <PreShortlistStep readOnly />
        </Stepper>
      </FormProvider>
    </div>
  );
}
