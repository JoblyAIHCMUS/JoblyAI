'use client';

import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
] as const;

const WORK_MODELS = [
  { value: 'on-site', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
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
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workModel, setWorkModel] = useState('');
  const [category, setCategory] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('none');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const skillInputRef = useRef<HTMLInputElement>(null);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
    // Keep input focused for rapid entry
    skillInputRef.current?.focus();
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    } else if (e.key === 'Escape') {
      setIsAddingSkill(false);
      setNewSkill('');
    }
  };

  // Validation for each step
  const canProceed = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Information
        return jobTitle.trim() !== '' && employmentType !== '' && workModel !== '' && category !== '';
      case 1: // Job Description
        return !isHtmlContentEmpty(jobDescription);
      default:
        return true;
    }
  };

  const handleComplete = () => {
    // Here you would normally:
    // 1. Validate all fields
    // 2. Call API to create job
    // 3. Show success toast / redirect
    const jobData = {
      companyId: selectedCompany?.id,
      companyName: selectedCompany?.name,
      jobTitle,
      jobDescription,
      employmentType,
      workModel,
      category,
      salaryCurrency,
      salaryMin,
      salaryMax,
      skills,
    };
    console.log('Job posted:', jobData);
    alert(`Job posted successfully for ${selectedCompany?.name || 'Unknown Company'}!`);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
      <p className="body-body-1-regular text-slate-600 mb-10">
        Fill in the details to create a new job posting.
      </p>

      <Stepper steps={POST_JOB_STEPS} onComplete={handleComplete} canProceed={canProceed}>
        {/* Step 1: Basic Information */}
        <div className="space-y-8 max-w-2xl mx-auto">
          {/* Job Title */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label htmlFor="job-title" className="label-label-1-semibold">
                Job Title
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Be specific - this is the first thing candidates see.
              </p>
            </div>
            <Input
              id="job-title"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Separator />

          {/* Type of Employment */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div>
              <Label className="label-label-1-semibold">
                Type of employment
              </Label>
            </div>
            <RadioGroup
              value={employmentType}
              onValueChange={setEmploymentType}
              className="flex flex-wrap gap-4"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="font-normal cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Work Model */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div>
              <Label className="label-label-1-semibold">
                Work model
              </Label>
            </div>
            <RadioGroup
              value={workModel}
              onValueChange={setWorkModel}
              className="flex flex-wrap gap-4"
            >
              {WORK_MODELS.map((model) => (
                <div key={model.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={model.value} id={model.value} />
                  <Label htmlFor={model.value} className="font-normal cursor-pointer">
                    {model.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Category */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label className="label-label-1-semibold">
                Category
              </Label>
            </div>
            <Select value={category} onValueChange={setCategory}>
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
              <Label className="label-label-1-semibold">
                Required Skills
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Skills useful for the job (Optional)
              </p>
            </div>
            <div className="space-y-3">
              {/* Add Skill Button / Input */}
              {isAddingSkill ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={skillInputRef}
                    type="text"
                    placeholder="Enter skill name"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="h-10 w-[200px]"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingSkill(false);
                      setNewSkill('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingSkill(true)}
                  className="text-primary border-primary hover:bg-primary/5"
                >
                  + Add Skills
                </Button>
              )}

              {/* Skills Tags */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 text-sm bg-primary/10 text-primary border-0 hover:bg-primary/15"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:bg-primary/20 rounded p-0.5"
                        aria-label={`Remove ${skill}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Salary */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label className="label-label-1-semibold">
                Salary
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Optional
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
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
              {salaryCurrency !== 'none' && (
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
              content={jobDescription}
              onChange={setJobDescription}
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