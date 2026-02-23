// app/employer/jobs/new/page.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Stepper } from '@/components/ui/stepper';

const POST_JOB_STEPS = [
  { id: 'title', label: 'Job Title' },
  { id: 'description', label: 'Description' },
  // { id: 'requirements', label: 'Requirements' },
  // { id: 'location', label: 'Location & Salary' },
  // { id: 'preview', label: 'Preview & Publish' },
] as const;

export default function EmployerNewJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleComplete = () => {
    // Here you would normally:
    // 1. Validate all fields
    // 2. Call API to create job
    // 3. Show success toast / redirect
    console.log('Job posted:', { jobTitle, jobDescription });
    alert('Job posted successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
      <p className="body-body-1-regular text-slate-600 mb-10">
        Fill in the details to create a new job posting.
      </p>

      <Stepper steps={POST_JOB_STEPS} onComplete={handleComplete}>
        {/* Step 1: Job Title */}
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="space-y-3">
            <Label htmlFor="job-title" className="label-label-1-semibold">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="job-title"
              placeholder="e.g. Senior Frontend Engineer (React / Next.js)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="h-12 text-base"
            />
            <p className="caption-caption-1-medium text-slate-500">
              Be specific - this is the first thing candidates see.
            </p>
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