'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
import ConfirmLogoChange from '@/components/ui/confirmLogoChange';
import { useCreateUploadUrl } from '@/api-hook/s3/useCreateUploadUrl';
import { useUploadToPresignedUrl } from '@/api-hook/s3/useUploadToPresignedUrl';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TeamManager, TeamMemberData } from '@/components/employer/teamManager';
import {
  convertUserToTeamMember,
  type TeamMember,
} from '../../new-company/data';
import {
  NEW_COMPANY_STEPS,
  SCALES,
  INDUSTRIES,
} from '../../new-company/constants';

import { useGetEmployerProfile } from '@/api-hook/employer/useGetEmployerProfile';
import { useGetCompany } from '@/api-hook/company/useGetCompany';
import { useEffect, useState, useRef } from 'react';
import {
  useAddCompanyEmployee,
  useGetCompanyEmployees,
  useUpdateCompany,
} from '@/api-hook/company';
import { useUpdateCompanyLogo } from '@/api-hook/company/useUpdateCompanyLogo';
import { type LogoUploaderHandle } from '@/components/employer/logoUploader';
import { companyUpdateSchema, type CompanyUpdateFormData } from './schema';
import { useUser } from '@/hooks/useUser';
import type { CompanyEmployee } from '@/api-client/company';

export default function EmployerCompanyProfileEditPage() {
  const mapEmployeesToTeamMembers = (employees: CompanyEmployee[]) =>
    employees.map((member) => ({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      avatar: member.avatarUrl || undefined,
      isEditable: true,
    }));

  const { data: currentUser } = useUser();
  const router = useRouter();
  const {
    data: employer,
    loading: loadingEmployer,
    error: errorEmployer,
    fetchEmployerProfile,
  } = useGetEmployerProfile();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const logoUploaderRef = useRef<LogoUploaderHandle>(null);
  const {
    data: company,
    loading: loadingCompany,
    error: errorCompany,
    fetchCompany,
  } = useGetCompany();
  const {
    data: companyEmployees,
    loading: loadingEmployees,
    fetchCompanyEmployees,
  } = useGetCompanyEmployees();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValidating },
    setValue,
    getValues,
  } = useForm<CompanyUpdateFormData>({
    resolver: zodResolver(companyUpdateSchema),
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

  // S3 upload hooks for logo
  const { createUploadUrl, loading: loadingUploadUrl } = useCreateUploadUrl();
  const { uploadToPresignedUrl, loading: loadingUpload } =
    useUploadToPresignedUrl();
  const [logoFileKey, setLogoFileKey] = useState<string | null>(null);
  const hasShownAccessDeniedToast = useRef(false);

  // Logo confirmation state
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState<string | null>(
    null
  );
  const [showLogoConfirmation, setShowLogoConfirmation] = useState(false);
  const [hasLoadedEmployees, setHasLoadedEmployees] = useState(false);

  const {
    updateLogoRecord,
    loading: updatingLogo,
    error: logoUpdateError,
  } = useUpdateCompanyLogo({
    onSuccess: (data) => {
      // Success handling is done in handleLogoConfirm
      // Just show toast here if needed
    },
    onError: () => {
      toast.error('Failed to update company logo. Please try again.');
    },
  });

  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const { submitAddEmployee, loading: addingMembers } = useAddCompanyEmployee();
  const {
    submitUpdate,
    loading: updatingCompany,
    error: updateError,
  } = useUpdateCompany({
    onSuccess: async (data) => {
      // Refresh employer profile in context to update topbar
      await fetchEmployerProfile();
      toast.success(`Company "${data.name}" updated successfully!`);
      router.back();
    },
    onError: (err) => {
      toast.error('Failed to update company. Please try again.');
    },
  });

  // Fetch employer and company on mount
  useEffect(() => {
    fetchEmployerProfile();
  }, []);

  useEffect(() => {
    if (!employer?.company?.id) {
      return;
    }

    if (!employer.isCompanyAdmin) {
      setCompanyId(null);

      if (!hasShownAccessDeniedToast.current) {
        hasShownAccessDeniedToast.current = true;
        toast.error('Only the company admin can edit the company profile.');
      }

      router.replace('/employer/company-profile');
      return;
    }

    setHasLoadedEmployees(false);
    setCompanyId(employer.company.id);
    fetchCompany(employer.company.id);
    void fetchCompanyEmployees(employer.company.id).finally(() => {
      setHasLoadedEmployees(true);
    });
  }, [employer, fetchCompany, fetchCompanyEmployees, router]);

  useEffect(() => {
    if (companyEmployees.length > 0) {
      setTeamMembers(mapEmployeesToTeamMembers(companyEmployees));
      return;
    }

    const owner = convertUserToTeamMember(currentUser ?? null);
    if (owner) {
      setTeamMembers([{ ...owner, isEditable: true }]);
    }
  }, [companyEmployees, currentUser]);

  // Initialize form fields when company data is loaded
  useEffect(() => {
    if (company) {
      setValue('companyName', company.name || '');
      setValue('website', company.websiteUrl || '');
      setValue(
        'scale',
        (company.sizeRange as
          | '1-50'
          | '51-100'
          | '101-250'
          | '251-500'
          | '501-1000'
          | '1001-5000'
          | '5001+'
          | undefined) || undefined
      );
      setValue('industry', company.industry || '');
      setValue('companyDescription', company.description || '');
      setValue('logoUrl', company.logoUrl || null);
      setLogoFileKey(
        company.logoUrl ? company.logoUrl.split('/').pop() || null : null
      );
    }
  }, [company, setValue]);

  const handleRoleChange = (email: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role: newRole } : m))
    );
  };

  const handleAddMember = async (member: TeamMember) => {
    if (!companyId) {
      return;
    }

    try {
      await submitAddEmployee(companyId, {
        email: member.email,
        role: member.role && member.role !== 'None' ? member.role : undefined,
      });

      try {
        const refreshedEmployees = await fetchCompanyEmployees(companyId);
        setTeamMembers(mapEmployeesToTeamMembers(refreshedEmployees));
      } catch {
        setTeamMembers((prev) => {
          if (prev.some((m) => m.email === member.email)) {
            return prev;
          }

          return [...prev, { ...member, isEditable: true }];
        });
        toast.warning('Member was added, but team list refresh failed.');
      }

      toast.success(`Added ${member.email} to company team`);
    } catch {
      toast.error(`Failed to add ${member.email} to company`);
    }
  };

  const handleComplete = async (data: CompanyUpdateFormData) => {
    if (!companyId) return;
    // Prepare payload for backend - exclude logoUrl as it's handled separately by updateLogoRecord
    const payload = {
      name: data.companyName,
      websiteUrl: data.website || undefined,
      sizeRange: data.scale || undefined,
      industry: data.industry || undefined,
      description: data.companyDescription || undefined,
    };
    try {
      await submitUpdate(companyId, payload);
    } catch {
      // Error handled in onError
    }
  };

  const handleLogoSelected = (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setSelectedLogoPreview(preview);
      setSelectedLogoFile(file);
      setShowLogoConfirmation(true);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoConfirm = async () => {
    if (!selectedLogoFile || !companyId) return;

    try {
      // Step 1: Get presigned upload URL from S3
      const uploadUrlResponse = await createUploadUrl({
        fileName: selectedLogoFile.name,
        fileType: selectedLogoFile.type,
        folder: 'logos',
      });

      // Step 2: Upload file directly to S3
      await uploadToPresignedUrl(
        uploadUrlResponse.uploadUrl,
        selectedLogoFile,
        {
          contentType: selectedLogoFile.type,
          folder: 'logos',
        }
      );

      // Step 3: Update company logo in database
      const updatedCompany = await updateLogoRecord(companyId, {
        fileKey: uploadUrlResponse.fileKey,
        fileUrl: uploadUrlResponse.fileUrl,
      });

      // Step 4: Update form values with new logo
      if (updatedCompany && updatedCompany.logoUrl) {
        setValue('logoUrl', updatedCompany.logoUrl);
        setLogoFileKey(
          updatedCompany.logoUrl
            ? updatedCompany.logoUrl.split('/').pop() || null
            : null
        );
      }

      // Step 5: Refresh employer profile in context to update topbar
      await fetchEmployerProfile();

      // Reset LogoUploader preview after successful upload
      logoUploaderRef.current?.resetPreview();

      // Show success toast
      toast.success('Company logo updated successfully!');

      // Reset confirmation state
      setShowLogoConfirmation(false);
      setSelectedLogoFile(null);
      setSelectedLogoPreview(null);
    } catch (err) {
      console.error('Failed to upload logo:', err);
      toast.error('Failed to upload logo. Please try again.');
    }
  };

  const handleLogoCancel = () => {
    setShowLogoConfirmation(false);
    setSelectedLogoFile(null);
    setSelectedLogoPreview(null);
  };

  const canProceed = (stepIndex: number): boolean => {
    const currentValues = getValues();
    switch (stepIndex) {
      case 0:
        // Check if basic info is valid (only company name is required)
        return (
          !!currentValues.companyName &&
          currentValues.companyName.trim().length >= 2 &&
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

  if (
    loadingEmployer ||
    (companyId && (loadingCompany || (loadingEmployees && !hasLoadedEmployees)))
  ) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        Loading...
      </div>
    );
  }
  if (errorEmployer) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 text-red-600">
        Failed to load employer profile.
      </div>
    );
  }
  if (employer?.company && !employer.isCompanyAdmin) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 text-red-600">
        Only the company admin can edit the company profile.
      </div>
    );
  }
  if (companyId && errorCompany) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 text-red-600">
        Failed to load company profile.
      </div>
    );
  }
  if (!company) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        No company profile found.
      </div>
    );
  }
  if (employer && !employer.isCompanyAdmin) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">403</h1>
        <p className="text-slate-600 text-sm sm:text-base">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Edit Company Profile
        </h1>
      </div>
      <p className="body-body-1-regular text-slate-600 mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base">
        Company details can be updated at any time.
      </p>
      {updatingCompany && (
        <div className="text-blue-600 mb-4 text-xs sm:text-sm">
          Updating company...
        </div>
      )}
      {addingMembers && (
        <div className="text-blue-600 mb-4 text-xs sm:text-sm">
          Adding team members...
        </div>
      )}
      {Boolean(updateError) && (
        <div className="text-red-600 mb-4 text-xs sm:text-sm">
          Failed to update company.{' '}
          {typeof updateError === 'string' ? updateError : ''}
        </div>
      )}
      <Stepper
        steps={NEW_COMPANY_STEPS}
        canProceed={canProceed}
        onComplete={handleSubmit(handleComplete)}
        loading={updatingCompany}
      >
        {/* Step 1: Basic Information */}
        <div className="space-y-8 max-w-2xl mx-auto">
          {/* Company logo */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
            <div className="pt-0 md:pt-3">
              <Label htmlFor="company-logo" className="label-label-1-semibold">
                Company logo
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                One icon/image that represents your organization.
              </p>
            </div>
            <div className="space-y-4">
              {/* Old Logo Display */}
              {logoUrl && (
                <div>
                  <Label className="label-label-1-semibold mb-1 block">
                    Current Logo
                  </Label>
                  <img
                    src={logoUrl}
                    alt="Current company logo"
                    className="h-[124px] w-[124px] object-cover rounded-[var(--radius-xl)] border border-gray-200"
                  />
                </div>
              )}
              {/* New Logo Uploader */}
              <div>
                <Label className="label-label-1-semibold mb-1 block">
                  {logoUrl
                    ? 'Replace Logo (optional)'
                    : 'Upload Logo (optional)'}
                </Label>
                <LogoUploader
                  ref={logoUploaderRef}
                  currentFileKey={logoFileKey || undefined}
                  onFileSelected={handleLogoSelected}
                  onValueChange={(url, file, fileKey) => {
                    // Update form when logo changes after confirmation
                    if (url) {
                      setValue('logoUrl', url);
                      setLogoFileKey(fileKey || null);
                    } else {
                      // If removing logo
                      setValue('logoUrl', null);
                      setLogoFileKey(null);
                    }
                  }}
                />
                {(loadingUploadUrl || loadingUpload || updatingLogo) && (
                  <span className="text-xs text-blue-500 ml-2">
                    Uploading logo...
                  </span>
                )}
                {Boolean(logoUpdateError) && (
                  <span className="text-xs text-red-500 ml-2">
                    Logo upload failed
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Details */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
            <div className="pt-0 md:pt-3">
              <Label className="label-label-1-semibold">Company Details</Label>
              <p className="text-xs text-slate-500 mt-1">
                Introduce your company core info quickly to users by fill up
                company details
              </p>
            </div>
            <div className="space-y-4 sm:space-y-6">
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
                  className={`h-10 sm:h-12 text-sm sm:text-base ${
                    errors.companyName ? 'border-red-500' : ''
                  }`}
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <p className="text-xs sm:text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
                {isValidating && (
                  <p className="text-xs sm:text-sm text-blue-500">
                    Validating...
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
                  className={`h-10 sm:h-12 text-sm sm:text-base ${
                    errors.website ? 'border-red-500' : ''
                  }`}
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-xs sm:text-sm text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

              {/* Scale & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2">
                  <Label className="label-label-1-semibold">
                    Scale <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={scale || ''}
                    onValueChange={(value) =>
                      setValue(
                        'scale',
                        value as
                          | '1-50'
                          | '51-100'
                          | '101-250'
                          | '251-500'
                          | '501-1000'
                          | '1001-5000'
                          | '5001+'
                      )
                    }
                  >
                    <SelectTrigger
                      className={`h-10 sm:h-12 text-sm sm:text-base ${
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
                    <p className="text-xs sm:text-sm text-red-500">
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
                      className={`h-10 sm:h-12 text-sm sm:text-base ${
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
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.industry.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: About Company */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-3xl mx-auto">
          <div className="space-y-3">
            <Label className="label-label-1-semibold">About Company</Label>
            <RichTextEditor
              content={companyDescription}
              onChange={(content) => {
                setValue('companyDescription', content);
              }}
              placeholder="Describe your company, its mission, values, and what makes it unique..."
              className={`min-h-[240px] sm:min-h-[320px] md:min-h-[360px] ${
                errors.companyDescription ? 'border-red-500' : ''
              }`}
            />
            {errors.companyDescription && (
              <p className="text-xs sm:text-sm text-red-500">
                {errors.companyDescription.message}
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Team */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-3xl mx-auto">
          <TeamManager
            members={teamMembers}
            onRoleChange={handleRoleChange}
            onAddMember={handleAddMember}
          />
        </div>
      </Stepper>

      {/* Logo Confirmation Dialog */}
      {showLogoConfirmation && (
        <ConfirmLogoChange
          currentLogoUrl={logoUrl || undefined}
          newLogoPreviewUrl={selectedLogoPreview || undefined}
          onConfirm={handleLogoConfirm}
          onCancel={handleLogoCancel}
          loading={loadingUploadUrl || loadingUpload || updatingLogo}
        />
      )}
    </div>
  );
}
