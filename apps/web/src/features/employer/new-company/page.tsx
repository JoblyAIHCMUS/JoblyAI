'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stepper } from '@/components/ui/stepper';
import { LogoUploader } from '@/components/employer/logoUploader';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { NEW_COMPANY_STEPS, SCALES, INDUSTRIES } from './constants';

const isHtmlContentEmpty = (html: string): boolean => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text === '';
};

export default function EmployerNewCompanyPage() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [scale, setScale] = useState('1-50');
  const [industry, setIndustry] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  const canProceed = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return companyName.trim() !== '' && scale !== '' && industry !== '';
      case 1:
        return !isHtmlContentEmpty(companyDescription);
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">
        Register your Company to Jobly
      </h1>
      <p className="body-body-1-regular text-slate-600 mb-10">
        Company details can be updated at any time after registration.
      </p>
      <Stepper steps={NEW_COMPANY_STEPS} canProceed={canProceed}>
        {/* Step 1: Basic Information */}
        <div className="space-y-8 max-w-2xl mx-auto">
          {/* Company logo */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label htmlFor="company-logo" className="label-label-1-semibold">
                Company logo
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                One icon/image that represents your organization.
              </p>
            </div>
            <LogoUploader />
          </div>

          <Separator />

          {/* Company Details */}
          <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
            <div className="pt-3">
              <Label className="label-label-1-semibold">Company Details</Label>
              <p className="text-xs text-slate-500 mt-1">
                Introduce your company core info quickly to users by fill up
                company details
              </p>
            </div>
            <div className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="company-name"
                  className="label-label-1-semibold"
                >
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company-name"
                  placeholder="e.g. Google LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="label-label-1-semibold">
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://www.example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              {/* Scale & Industry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-label-1-semibold">
                    Scale <span className="text-red-500">*</span>
                  </Label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="label-label-1-semibold">
                    Industry <span className="text-red-500">*</span>
                  </Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: About Company */}
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="space-y-3">
            <Label className="label-label-1-semibold">
              About Company <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              content={companyDescription}
              onChange={setCompanyDescription}
              placeholder="Describe your company, its mission, values, and what makes it unique..."
              className="min-h-[360px]"
            />
          </div>
        </div>

        {/* Step 3: Team */}
        <div className="space-y-8 max-w-2xl mx-auto"></div>
      </Stepper>
    </div>
  );
}
