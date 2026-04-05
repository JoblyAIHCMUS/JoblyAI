'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import {
  getCurrentUser,
  convertUserToTeamMember,
  type TeamMember,
} from './data';
import { useUser } from '@/hooks/useUser';
import { NEW_COMPANY_STEPS, SCALES, INDUSTRIES } from './constants';
import { useCreateCompany } from '@/api-hook/company';
import { useGetEmployerProfile } from '@/api-hook/employer';
import {
  companyRegistrationSchema,
  type CompanyRegistrationFormData,
} from './schema';

export default function EmployerNewCompanyPage() {
  const { data: currentUser } = useUser();
  const { fetchEmployerProfile } = useGetEmployerProfile();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValidating },
    setValue,
    getValues,
  } = useForm<CompanyRegistrationFormData>({
    resolver: zodResolver(companyRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      companyName: '',
      website: '',
      scale: undefined,
      industry: '',
      companyDescription: '',
      logoUrl: null,
    },
  });

  // Watch fields for tracking
  const companyDescription: string = watch('companyDescription') ?? '';
  const logoUrl = watch('logoUrl');
  const scale = watch('scale');
  const industry = watch('industry');

  const {
    upload: uploadLogoToS3,
    loading: logoUploading,
    error: logoUploadError,
  } = useUploadFile();

  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>(() => {
    // Use actual user data if available, otherwise use mock data
    const initialUser = currentUser
      ? convertUserToTeamMember(currentUser)
      : getCurrentUser();

    return initialUser
      ? [{ ...initialUser, isEditable: true }]
      : [{ ...getCurrentUser(), isEditable: true }];
  });

  // Company creation hook
  const {
    submitCompany,
    loading: creatingCompany,
    error: createError,
  } = useCreateCompany({
    onSuccess: async (data) => {
      toast.success(`Company "${data.name}" registered successfully!`);
      // Refetch employer profile to update affiliation
      try {
        await fetchEmployerProfile();
      } catch (err) {
        console.error('Failed to refetch employer profile:', err);
      }
      // Redirect to dashboard after a short delay
      // Using window.location to force sidebar and topbar to remount with fresh data
      setTimeout(() => {
        window.location.href = '/employer/dashboard';
      }, 1500);
    },
    onError: (err) => {
      toast.error('Failed to register company. Please try again.');
    },
  });

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

  const handleComplete = async (data: CompanyRegistrationFormData) => {
    // Prepare payload for backend
    const payload = {
      name: data.companyName,
      websiteUrl: data.website || undefined,
      sizeRange: data.scale || undefined,
      industry: data.industry || undefined,
      description: data.companyDescription || undefined,
      logoUrl: data.logoUrl || undefined,
    };
    try {
      await submitCompany(payload);
    } catch {
      // Error handled in onError
    }
  };

  const canProceed = (stepIndex: number): boolean => {
    const currentValues = getValues();
    switch (stepIndex) {
      case 0:
        // Check if basic info is valid
        return (
          !!currentValues.companyName &&
          currentValues.companyName.trim().length >= 2 &&
          !!currentValues.scale &&
          !!currentValues.industry &&
          !errors.companyName &&
          !errors.scale &&
          !errors.industry &&
          !errors.website
        );
      case 1:
        // Description is now optional
        return !errors.companyDescription;
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
      {creatingCompany && (
        <div className="text-blue-600 mb-4">Registering company...</div>
      )}
      {Boolean(createError) && (
        <div className="text-red-600 mb-4">
          Failed to register company.{' '}
          {typeof createError === 'string' ? createError : ''}
        </div>
      )}
      <Stepper
        steps={NEW_COMPANY_STEPS}
        canProceed={canProceed}
        onComplete={handleSubmit(handleComplete)}
        loading={creatingCompany}
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
                currentFileKey={logoUrl ? logoUrl.split('/').pop() : undefined}
                onValueChange={(url, _file, fileKey) => {
                  setValue('logoUrl', url || null);
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
                  className={`h-12 text-base ${
                    errors.companyName ? 'border-red-500' : ''
                  }`}
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
                {isValidating && (
                  <p className="text-sm text-blue-500">
                    Checking availability...
                  </p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="label-label-1-semibold">
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://www.example.com"
                  className={`h-12 text-base ${
                    errors.website ? 'border-red-500' : ''
                  }`}
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

              {/* Scale & Industry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-label-1-semibold">
                    Scale <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={scale || ''}
                    onValueChange={(value) => setValue('scale', value as any)}
                  >
                    <SelectTrigger
                      className={`h-12 text-base ${
                        errors.scale ? 'border-red-500' : ''
                      }`}
                    >
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.scale && (
                    <p className="text-sm text-red-500">
                      {errors.scale.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="label-label-1-semibold">
                    Industry <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={industry}
                    onValueChange={(value) => setValue('industry', value)}
                  >
                    <SelectTrigger
                      className={`h-12 text-base ${
                        errors.industry ? 'border-red-500' : ''
                      }`}
                    >
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-red-500">
                      {errors.industry.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: About Company */}
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="space-y-3">
            <Label className="label-label-1-semibold">About Company</Label>
            <RichTextEditor
              content={companyDescription}
              onChange={(content) => {
                setValue('companyDescription', content);
              }}
              placeholder="Describe your company, its mission, values, and what makes it unique..."
              className={`min-h-[360px] ${
                errors.companyDescription ? 'border-red-500' : ''
              }`}
            />
            {errors.companyDescription && (
              <p className="text-sm text-red-500">
                {errors.companyDescription.message}
              </p>
            )}
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
