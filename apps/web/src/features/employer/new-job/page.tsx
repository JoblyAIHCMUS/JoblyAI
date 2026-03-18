'use client';

import { useState } from 'react';
import { useCreateJob } from '@/api-hook/useCreateJob';
import { useSkillIds } from '@/api-hook/useSkillIds';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SkillTagsManager,
  type SkillEntry,
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
import { useCompany } from '@/hooks/useCompany';

const POST_JOB_STEPS = [
  { id: 'basic-info', label: 'Basic Information' },
  { id: 'description', label: 'Job Description' },
  // { id: 'location', label: 'Location & Salary' },
  // { id: 'preview', label: 'Preview & Publish' },
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

const CATEGORIES = [
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'human-resources', label: 'Human Resources' },
  { value: 'operations', label: 'Operations' },
  { value: 'other', label: 'Other' },
] as const;

// Helper to check if HTML content has actual text (not just empty tags like <p></p>)
const isHtmlContentEmpty = (html: string): boolean => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text === '';
};

export default function EmployerNewJobPage() {
  const { selectedCompany } = useCompany();
  const router = useRouter();
  const { createJob, loading, error } = useCreateJob({
    onSuccess: () => {
      alert('Job posted successfully!');
      router.push('/employer/job-listing');
    },
    onError: (err) => {
      alert('Failed to post job.');
    },
  });
  const { getOrCreateSkills, loading: skillsLoading } = useSkillIds();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [remote, setRemote] = useState(false);
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState('none');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [skills, setSkills] = useState<SkillEntry[]>([]);

  // Validation for each step
  const canProceed = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Information
        return title.trim() !== '' && type !== '' && categoryId !== '';
      case 1: // Job Description
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
            skillId: skillObj ? skillObj.id : 0, // fallback 0 if not found (should not happen)
            importance: s.importance,
            minYearsExperience: s.minYearsExperience,
          };
        });
      }
      const payload = {
        title,
        description,
        type,
        remote,
        location: remote ? undefined : location,
        categoryId: Number(categoryId),
        currency: currency === 'none' ? undefined : currency.toUpperCase(),
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        companyName: selectedCompany?.name,
        requirements,
      };
      await createJob(payload);
    } catch (e) {
      // Error handled in hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
      <p className="body-body-1-regular text-slate-600 mb-10">
        Fill in the details to create a new job posting.
      </p>

      <Stepper
        steps={POST_JOB_STEPS}
        onComplete={handleComplete}
        canProceed={canProceed}
        loading={loading || skillsLoading}
      >
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error.message || 'Failed to post job.'}
          </div>
        )}
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
            <div className=" grid grid-rows-[auto_auto] gap-4">
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
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
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
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
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

        {/* Future steps would go here as additional sibling elements */}
      </Stepper>
    </div>
  );
}
