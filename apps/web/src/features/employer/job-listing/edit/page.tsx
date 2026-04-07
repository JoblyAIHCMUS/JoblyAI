'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SkillTagsManager,
  type SkillEntry,
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
import { useJobDetail } from '@/api-hook/jobs/useJobDetail';
import { useUpdateJob } from '@/api-hook/jobs/useUpdateJob';
import { useCategories } from '@/api-hook/jobs/useCategories';
import { useSkillIds } from '@/api-hook/skills/useSkillIds';
import type { EmploymentType, RequirementImportance } from '@/api-client/jobs';

const EDIT_JOB_STEPS = [
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

// Helper to convert SkillImportance to RequirementImportance
const convertToRequirementImportance = (
  importance: SkillImportance
): RequirementImportance => {
  if (importance === 'OPTIONAL') {
    return 'OPTIONAL';
  }
  return importance as RequirementImportance;
};

const isHtmlContentEmpty = (html: string): boolean => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text === '';
};

export default function JobListingEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = parseInt(id, 10);

  // API hooks for fetching and updating
  const { fetchJobDetail, data: jobData, loading: jobLoading } = useJobDetail();
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    submitUpdate,
    loading: submitLoading,
    error: submitError,
  } = useUpdateJob({
    onSuccess: () => {
      alert('Job updated successfully!');
      router.replace(`/employer/job-listing/${id}`);
    },
    onError: (err) => {
      alert('Failed to update job');
    },
  });
  const { getOrCreateSkills, loading: skillsLoading } = useSkillIds();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('');
  const [remote, setRemote] = useState(false);
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [currency, setCurrency] = useState<string>('none');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [skills, setSkills] = useState<SkillEntry[]>([]);

  // Fetch job data on mount
  useEffect(() => {
    fetchJobDetail(jobId);
  }, [jobId, fetchJobDetail]);

  // Populate form state when job data is loaded
  useEffect(() => {
    if (jobData) {
      setTitle(jobData.title);
      setDescription(jobData.description);
      setType(jobData.type);
      setRemote(jobData.remote);
      setLocation(jobData.location || '');
      setCategoryId(jobData.category.id.toString());
      setCurrency(jobData.currency ? jobData.currency.toLowerCase() : 'none');
      setSalaryMin(jobData.salaryMin ? jobData.salaryMin.toString() : '');
      setSalaryMax(jobData.salaryMax ? jobData.salaryMax.toString() : '');
      // Backend provides requirements with skill details, map to SkillEntry
      setSkills(
        (jobData.requirements || []).map((req) => ({
          name: req.skillName,
          importance: req.importance,
          minYearsExperience: req.minYearsExperience ?? undefined,
        }))
      );
    }
  }, [jobData]);

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Loading job...</h1>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Job not found</h1>
      </div>
    );
  }

  const canProceed = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return title.trim() !== '' && type !== '' && categoryId !== '';
      case 1:
        return !isHtmlContentEmpty(description);
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    try {
      // 1. Resolve skill IDs (create if needed)
      let requirements = undefined;
      if (skills.length > 0) {
        const skillObjs = await getOrCreateSkills(skills.map((s) => s.name));
        // Map skill names to IDs
        requirements = skills.map((s) => {
          const skillObj = skillObjs.find(
            (obj) => obj.name.toLowerCase() === s.name.toLowerCase()
          );
          return {
            skillId: skillObj ? skillObj.id : 0,
            importance: convertToRequirementImportance(s.importance),
            minYearsExperience: s.minYearsExperience,
          };
        });
      }

      // Build the update payload
      const payload = {
        title,
        description,
        type: type as EmploymentType,
        remote,
        location: remote ? undefined : location,
        categoryId: Number(categoryId),
        currency: currency === 'none' ? undefined : currency.toUpperCase(),
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        requirements,
      };

      await submitUpdate(jobId, payload);
    } catch (err) {
      // Error handled in hook
      console.error('Failed to update job:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h1 className="text-3xl font-bold">Edit Job</h1>
      </div>
      <p className="body-body-1-regular text-slate-600 mb-10">
        Update the details for <strong>{jobData.title}</strong>.
      </p>

      {submitError ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">
            {submitError instanceof Error
              ? (submitError.message as React.ReactNode)
              : typeof submitError === 'string'
              ? (submitError as React.ReactNode)
              : 'Failed to update job'}
          </p>
        </div>
      ) : null}

      <Stepper
        steps={EDIT_JOB_STEPS}
        onComplete={handleComplete}
        canProceed={canProceed}
        loading={submitLoading || skillsLoading}
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
            <Input
              id="title"
              placeholder="e.g. Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Separator />

          {/* Type of Employment */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div>
              <Label className="label-label-1-semibold">
                Type of employment <span className="text-red-500">*</span>
              </Label>
            </div>
            <RadioGroup
              value={type}
              onValueChange={setType}
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
              <Input
                id="location"
                placeholder="e.g. 123 This Street, That Town, The Other Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={remote}
                className="h-12 text-base"
              />
              {/* Remote Work */}
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  id="remote"
                  checked={remote}
                  onCheckedChange={(checked) => {
                    setRemote(checked);
                    if (checked) setLocation('');
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
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <div className="p-2 text-sm text-slate-500">
                    Loading categories...
                  </div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
            <SkillTagsManager skills={skills} onChange={setSkills} />
          </div>

          <Separator />

          {/* Salary */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label className="label-label-1-semibold">Salary</Label>
              <p className="text-xs text-slate-500 mt-1">Optional</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[100px] h-12">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currency !== 'none' && (
                <>
                  <Input
                    type="number"
                    placeholder="0"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="h-12 text-base w-[120px]"
                    min="0"
                  />
                  <span className="text-slate-500">to</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="h-12 text-base w-[120px]"
                    min="0"
                  />
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
              onChange={setDescription}
              placeholder="Describe the role, key responsibilities, required skills, qualifications, what we offer, and any other important information..."
              className="min-h-[360px]"
            />
          </div>
        </div>
      </Stepper>
    </div>
  );
}
