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
import { useUploadFile } from '@/api-hook/s3/useUploadFile';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TeamManager, TeamMemberData } from '@/components/employer/teamManager';
import { getCurrentUser, type TeamMember } from './data';
import { NEW_COMPANY_STEPS, SCALES, INDUSTRIES } from './constants';

const isHtmlContentEmpty = (html: string): boolean => {
  if (!html) return true;

  // In a browser environment, use DOM parsing to robustly extract text content
  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = html;
    const rawText = container.textContent ?? container.innerText ?? '';
    const normalizedText = rawText.replace(/\u00A0/g, ' ').trim();
    return normalizedText === '';
  }

  // Fallback: strip tags and handle non-breaking spaces if DOM is unavailable
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text === '';
};

export default function EmployerNewCompanyPage() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [scale, setScale] = useState('1-50');
  const [industry, setIndustry] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFileKey, setLogoFileKey] = useState<string | null>(null);
  const {
    upload: uploadLogoToS3,
    loading: logoUploading,
    error: logoUploadError,
  } = useUploadFile();

  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>(() => [
    { ...getCurrentUser(), isEditable: true },
  ]);

  const handleRoleChange = (email: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role: newRole } : m))
    );
  };

  const handleAddMember = (member: TeamMember) => {
    setTeamMembers((prev) => {
      if (prev.some((m) => m.email === member.email)) return prev;
      return [...prev, { ...member, isEditable: true }];
    });
  };

  const handleComplete = () => {
    const companyData = {
      companyName,
      website,
      scale,
      industry,
      companyDescription,
      logoUrl,
      teamMembers: teamMembers.map(({ firstName, lastName, email, role }) => ({
        name: `${firstName} ${lastName}`,
        email,
        role,
      })),
    };
    console.log('Company registered:', companyData);
    alert(`Company "${companyName}" registered successfully!`);
  };

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
      <Stepper
        steps={NEW_COMPANY_STEPS}
        canProceed={canProceed}
        onComplete={handleComplete}
      >
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
            <div className="space-y-1">
              <LogoUploader
                currentFileKey={logoFileKey}
                onValueChange={(url, _file, fileKey) => {
                  setLogoUrl(url || null);
                  setLogoFileKey(fileKey || null);
                }}
                onUploadFile={async (file) => {
                  const result = await uploadLogoToS3(file, 'logos');
                  return { url: result.fileUrl, fileKey: result.fileKey };
                }}
              />
              {logoUploading && (
                <span className="text-xs text-blue-500 ml-2">
                  Uploading logo...
                </span>
              )}
              {Boolean(logoUploadError) && (
                <span className="text-xs text-red-500 ml-2">
                  Logo upload failed
                </span>
              )}
            </div>
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
        <div className="space-y-8 max-w-3xl mx-auto">
          <TeamManager
            members={teamMembers}
            onRoleChange={handleRoleChange}
            onAddMember={handleAddMember}
          />
        </div>
      </Stepper>
    </div>
  );
}
