'use client';

// useState import removed (duplicate)
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
import { getCurrentUser, type TeamMember } from '../../new-company/data';
import {
  NEW_COMPANY_STEPS,
  SCALES,
  INDUSTRIES,
} from '../../new-company/constants';

import { useGetEmployerProfile } from '@/api-hook/employer/useGetEmployerProfile';
import { useGetCompany } from '@/api-hook/company/useGetCompany';
import { useEffect, useState } from 'react';
import { useUpdateCompany } from '@/api-hook/company';

const isHtmlContentEmpty = (html: string): boolean => {
  if (!html) return true;
  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = html;
    const rawText = container.textContent ?? container.innerText ?? '';
    const normalizedText = rawText.replace(/\u00A0/g, ' ').trim();
    return normalizedText === '';
  }
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text === '';
};

export default function EmployerCompanyProfileEditPage() {
  const router = useRouter();
  const {
    data: employer,
    loading: loadingEmployer,
    error: errorEmployer,
    fetchEmployerProfile,
  } = useGetEmployerProfile();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const {
    data: company,
    loading: loadingCompany,
    error: errorCompany,
    fetchCompany,
  } = useGetCompany();

  // State for form fields, initialized after company is loaded
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
  const {
    submitUpdate,
    loading: updatingCompany,
    error: updateError,
  } = useUpdateCompany({
    onSuccess: (data) => {
      alert(`Company "${data.name}" updated successfully!`);
      router.back();
    },
    onError: (err) => {
      alert('Failed to update company. Please try again.');
    },
  });

  // Fetch employer and company on mount
  useEffect(() => {
    fetchEmployerProfile();
  }, [fetchEmployerProfile]);

  useEffect(() => {
    if (employer?.company?.id) {
      setCompanyId(employer.company.id);
      fetchCompany(employer.company.id);
    }
  }, [employer, fetchCompany]);

  // Initialize form fields when company data is loaded
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || '');
      setWebsite(company.websiteUrl || '');
      setScale(company.sizeRange || '1-50');
      setIndustry(company.industry || '');
      setCompanyDescription(company.description || '');
      setLogoUrl(company.logoUrl || null);
    }
  }, [company]);

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

  const handleComplete = async () => {
    if (!companyId) return;
    // Prepare payload for backend
    const payload = {
      name: companyName,
      websiteUrl: website || undefined,
      sizeRange: scale || undefined,
      industry: industry || undefined,
      description: companyDescription || undefined,
      logoUrl: logoUrl || undefined, // S3 url
    };
    try {
      await submitUpdate(companyId, payload);
    } catch {
      // Error handled in onError
    }
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

  if (loadingEmployer || (companyId && loadingCompany)) {
    return <div className="container mx-auto px-4 py-10">Loading...</div>;
  }
  if (errorEmployer) {
    return (
      <div className="container mx-auto px-4 py-10 text-red-600">
        Failed to load employer profile.
      </div>
    );
  }
  if (companyId && errorCompany) {
    return (
      <div className="container mx-auto px-4 py-10 text-red-600">
        Failed to load company profile.
      </div>
    );
  }
  if (!company) {
    return (
      <div className="container mx-auto px-4 py-10">
        No company profile found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h1 className="text-3xl font-bold">Edit Company Profile</h1>
      </div>
      <p className="body-body-1-regular text-slate-600 mb-10">
        Company details can be updated at any time.
      </p>
      {updatingCompany && (
        <div className="text-blue-600 mb-4">Updating company...</div>
      )}
      {Boolean(updateError) && (
        <div className="text-red-600 mb-4">
          Failed to update company.{' '}
          {typeof updateError === 'string' ? updateError : ''}
        </div>
      )}
      <Stepper
        steps={NEW_COMPANY_STEPS}
        canProceed={canProceed}
        onComplete={handleComplete}
        loading={updatingCompany}
      >
        <>
          {/* Step 1: Basic Information */}
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Company logo */}
            <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
              <div className="pt-3">
                <Label
                  htmlFor="company-logo"
                  className="label-label-1-semibold"
                >
                  Company logo
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  One icon/image that represents your organization.
                </p>
              </div>
              <div className="space-y-4">
                {/* Old Logo Display */}
                <div>
                  <Label className="label-label-1-semibold mb-1 block">
                    Old Logo
                  </Label>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Current company logo"
                      className="h-[124px] w-[124px] object-cover rounded-[var(--radius-xl)] border border-gray-200"
                    />
                  ) : (
                    <div className="h-[124px] w-[124px] flex items-center justify-center bg-gray-100 rounded-[var(--radius-xl)] border border-gray-200 text-gray-400">
                      No logo
                    </div>
                  )}
                </div>
                {/* New Logo Uploader */}
                <div>
                  <Label className="label-label-1-semibold mb-1 block">
                    New Logo (optional)
                  </Label>
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
            </div>

            <Separator />

            {/* Company Details */}
            <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
              <div className="pt-3">
                <Label className="label-label-1-semibold">
                  Company Details
                </Label>
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
        </>
      </Stepper>
    </div>
  );
}
