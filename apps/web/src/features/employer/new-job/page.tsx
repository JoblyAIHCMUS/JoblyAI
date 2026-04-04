'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useCreateJob } from '@/api-hook/jobs';
import { useSkillIds } from '@/api-hook/skills';
import { useCategories } from '@/api-hook/jobs';
import { useGetEmployerProfile } from '@/api-hook/employer';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkillTagsManager } from '@/components/employer/skillTagsManager';
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
import { jobPostingSchema, type JobPostingFormData } from './schema';
import type { EmploymentType, RequirementImportance } from '@/api-client/jobs';

const POST_JOB_STEPS = [
  { id: 'basic-info', label: 'Basic Information' },
  { id: 'description', label: 'Job Description' },
] as const;

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
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
  importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL'
): RequirementImportance => {
  if (importance === 'OPTIONAL') {
    return 'OPTIONAL';
  }
  return importance as RequirementImportance;
};

export default function EmployerNewJobPage() {
  const router = useRouter();
  const {
    fetchEmployerProfile,
    data: employerProfile,
    loading: employerProfileLoading,
  } = useGetEmployerProfile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    mode: 'onBlur',
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
    },
  });

  // Watch fields for tracking
  const remote = watch('remote');
  const currency = watch('currency');
  const description = watch('description');
  const skills = watch('skills');
  const type = watch('type');
  const categoryId = watch('categoryId');

  const { submitJob, loading: creatingJob } = useCreateJob({
    onSuccess: () => {
      toast.success('Job posted successfully!');
      router.push('/employer/job-listing');
    },
    onError: (err) => {
      toast.error('Failed to post job. Please try again.');
    },
  });

  const { getOrCreateSkills, loading: skillsLoading } = useSkillIds();
  const { categories, loading: categoriesLoading } = useCategories();

  // Fetch employer profile on mount to get company ID
  useEffect(() => {
    fetchEmployerProfile();
  }, [fetchEmployerProfile]);

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
          !errors.categoryId
        );
      case 1: // Job Description
        return !errors.description && !isHtmlContentEmpty(description);
      default:
        return true;
    }
  };

  const handleComplete = async (data: JobPostingFormData) => {
    try {
      // 1. Resolve skill IDs (create if needed)
      let requirements = undefined;
      if (data.skills && data.skills.length > 0) {
        const skillObjs = await getOrCreateSkills(
          data.skills.map((s) => s.name)
        );
        // Map skill names to IDs
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

      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        remote: data.remote,
        location: data.remote ? undefined : data.location,
        categoryId: Number(data.categoryId),
        currency:
          data.currency === 'none' ? undefined : data.currency.toUpperCase(),
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        companyId: employerProfile?.company?.id || 0,
        requirements,
      };
      await submitJob(payload);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="heading-h4-semi-bold mb-6">Post a New Job</h1>
      <p className="body-body-1-regular text-slate-600 mb-10">
        Fill in the details to create a new job posting.
      </p>

      <Stepper
        steps={POST_JOB_STEPS}
        onComplete={handleSubmit((data) =>
          handleComplete(data as unknown as JobPostingFormData)
        )}
        canProceed={canProceed}
        loading={
          creatingJob ||
          skillsLoading ||
          categoriesLoading ||
          employerProfileLoading
        }
      >
        {/* Step 1: Basic Information */}
        <div className="space-y-8 max-w-2xl mx-auto">
          {/* Job Title */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label htmlFor="title" className="label-label-1-semibold">
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
                className={`h-12 text-base ${
                  errors.title ? 'border-red-500' : ''
                }`}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Type of Employment */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div>
              <Label className="label-label-1-semibold">
                Type of employment <span className="text-red-500">*</span>
              </Label>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>
            <RadioGroup
              value={type}
              onValueChange={(value) =>
                setValue('type', value as EmploymentType)
              }
              className="flex flex-wrap gap-4"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <div key={t.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={t.value} id={t.value} />
                  <Label
                    htmlFor={t.value}
                    className="font-normal cursor-pointer"
                  >
                    {t.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Location */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label htmlFor="location" className="label-label-1-semibold">
                Location
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Where is the job based?
              </p>
            </div>
            <div className="grid grid-rows-[auto_auto] gap-4">
              <div className="space-y-1">
                <Input
                  id="location"
                  placeholder="e.g. 123 This Street, That Town, The Other Country"
                  disabled={remote}
                  className={`h-12 text-base ${
                    errors.location ? 'border-red-500' : ''
                  }`}
                  {...register('location')}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>
              {/* Remote Work */}
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  id="remote"
                  className="data-[state=checked]:bg-black"
                  checked={remote}
                  onCheckedChange={(checked) => {
                    setValue('remote', checked);
                    if (checked) setValue('location', '');
                  }}
                />
                <Label htmlFor="remote" className="font-normal cursor-pointer">
                  This is a remote position
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Category */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label className="label-label-1-semibold">
                Category <span className="text-red-500">*</span>
              </Label>
            </div>
            <div className="space-y-1">
              <Select
                value={categoryId}
                onValueChange={(value: string) => setValue('categoryId', value)}
              >
                <SelectTrigger
                  className={`h-12 text-base ${
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
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Required Skills */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div>
              <Label className="label-label-1-semibold">Required Skills</Label>
              <p className="text-xs text-slate-500 mt-1">
                Skills useful for the job (Optional)
              </p>
            </div>
            <SkillTagsManager
              skills={skills}
              onChange={(newSkills) => {
                const normalizedSkills = newSkills.map((skill) => ({
                  ...skill,
                  minYearsExperience: (skill.minYearsExperience ?? 0) as number,
                }));
                setValue('skills', normalizedSkills);
              }}
            />
          </div>

          <Separator />

          {/* Salary */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label className="label-label-1-semibold">Salary</Label>
              <p className="text-xs text-slate-500 mt-1">Optional</p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={currency}
                onValueChange={(value) =>
                  setValue(
                    'currency',
                    value as
                      | 'none'
                      | 'usd'
                      | 'eur'
                      | 'gbp'
                      | 'vnd'
                      | 'jpy'
                      | 'cny'
                  )
                }
              >
                <SelectTrigger className="w-[100px] h-12">
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
                  <div className="space-y-1 w-[120px]">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="h-12 text-base"
                      min="0"
                      {...register('salaryMin', { valueAsNumber: true })}
                    />
                    {errors.salaryMin && (
                      <p className="text-xs text-red-500">
                        {errors.salaryMin.message}
                      </p>
                    )}
                  </div>
                  <span className="text-slate-500">to</span>
                  <div className="space-y-1 w-[120px]">
                    <Input
                      type="number"
                      placeholder="Max"
                      className="h-12 text-base"
                      min="0"
                      {...register('salaryMax', { valueAsNumber: true })}
                    />
                    {errors.salaryMax && (
                      <p className="text-xs text-red-500">
                        {errors.salaryMax.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Job Description */}
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="space-y-3">
            <Label className="label-label-1-semibold">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              content={description}
              onChange={(content) => setValue('description', content)}
              placeholder="Describe the role, key responsibilities, required skills, qualifications, what we offer, and any other important information..."
              className={`min-h-[360px] ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </Stepper>
    </div>
  );
}
