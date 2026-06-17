'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Share2, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { sanitizeRedirectPath } from '@/lib/utils';
import { formatJobType } from '@/features/find-jobs/job-detail/job.utils';
import { SubmitApplicationModal } from '@/components/find-jobs/submit-application-modal';
import { InterviewPrepModal } from '@/components/interview/interview-prep-modal';
import type { EmploymentType } from '@/types/job';

export type JobDetailBreadcrumbItem = {
  label: string;
  href?: string;
};

export interface CompanyInfo {
  id: number;
  name: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
}

interface JobDetailHeaderProps {
  breadcrumbItems: JobDetailBreadcrumbItem[];
  jobTitle: string;
  company: CompanyInfo;
  address: string;
  workType: string;
  jobId: number;
  jobType?: EmploymentType;
  hasApplied?: boolean;
}

export default function JobDetailHeader({
  breadcrumbItems,
  jobTitle,
  company,
  address,
  workType,
  jobId,
  jobType = 'FULL_TIME',
  hasApplied = false,
}: JobDetailHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useUser();
  const isApplied = Boolean(hasApplied);
  const userRole = user?.role ?? null;
  const canApplyRole = userRole === 'candidate';
  const disableApply = isApplied || Boolean(user && !canApplyRole);
  const applyButtonText = !user
    ? 'Sign in to Apply'
    : isApplied
    ? 'Applied'
    : 'Apply';

  useEffect(() => {
    console.log('[JobDetailHeader] useEffect mounted/updated', { 
      jobId, 
      openPrepParam: searchParams.get('openPrep'), 
      isApplied 
    });

    // 1. Listen for the window event (instant trigger if already on page)
    const handleOpenModal = (event: any) => {
      console.log('[JobDetailHeader] Received OPEN_INTERVIEW_PREP_MODAL event', event.detail);
      if (event.detail && Number(event.detail.jobId) === Number(jobId)) {
        console.log('[JobDetailHeader] Job IDs match, opening modal');
        setIsPrepModalOpen(true);
      }
    };
    window.addEventListener('OPEN_INTERVIEW_PREP_MODAL', handleOpenModal);

    // 2. Check query param (trigger on mount/redirect)
    if (searchParams.get('openPrep') === 'true') {
      console.log('[JobDetailHeader] openPrep is true in URL. isApplied:', isApplied);
      if (isApplied) {
        console.log('[JobDetailHeader] isApplied is true, opening modal and cleaning URL');
        setIsPrepModalOpen(true);
        // Clean up URL to avoid re-opening on refresh
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('openPrep');
        const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
        window.history.replaceState(null, '', newUrl);
      } else {
        console.log('[JobDetailHeader] Waiting for isApplied to become true...');
      }
    }

    return () => {
      window.removeEventListener('OPEN_INTERVIEW_PREP_MODAL', handleOpenModal);
    };
  }, [jobId, searchParams, isApplied]);

  const handleApply = () => {
    if (isApplied) return;
    if (!user) {
      const basePath =
        userRole === 'candidate'
          ? `/candidate/find-jobs/${jobId}`
          : `/find-jobs/${jobId}`;
      const redirectPath = sanitizeRedirectPath(basePath);
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    } else if (canApplyRole) {
      setIsModalOpen(true);
    }
  };
  return (
    <section className="relative overflow-hidden bg-[#F8F8FD] pt-14 sm:pt-16 lg:pt-[72px]">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 hidden h-[436px] w-[520px] overflow-hidden lg:block opacity-60">
          <Image
            src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/Pattern.svg"
            alt=""
            width={834}
            height={436}
            className="absolute left-0 top-5 h-auto w-[834px] max-w-none"
          />
        </div>
        <div className="absolute left-0 top-14 hidden h-[436px] w-[244px] overflow-hidden lg:block opacity-60">
          <Image
            src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/Pattern.svg"
            alt=""
            width={834}
            height={436}
            className="absolute -left-[600px] top-5 h-auto w-[834px] max-w-none"
          />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-10">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 lg:mb-8 flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 flex-wrap">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-slate-700 transition-colors truncate"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`truncate ${
                      isLast ? 'font-semibold text-slate-900' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && <span>/</span>}
              </div>
            );
          })}
        </nav>

        {/* Job Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          {/* Left: Logo + Info */}
          <div className="flex w-full min-w-0 items-start justify-between gap-3 sm:gap-4 lg:gap-6">
            <div className="flex min-w-0 items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px] shrink-0 rounded-lg overflow-hidden border border-slate-100">
                <Image
                  src={company.logoUrl || '/placeholder-logo.png'}
                  alt={`${company.name} company logo`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h1 className="text-[22px] sm:text-[26px] lg:text-[32px] font-semibold leading-tight text-slate-900 break-words">
                  {jobTitle}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 text-sm sm:text-base flex-wrap">
                  <span>{company.name}</span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span>{address}</span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span>{formatJobType(workType)}</span>
                </div>
              </div>
            </div>
            <button
              className="sm:hidden text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0"
              aria-label="Share job"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex w-full sm:w-auto items-center justify-end gap-3 sm:gap-4 lg:gap-6 shrink-0">
            <button
              className="hidden sm:inline-flex text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label="Share job"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="w-px h-10 bg-slate-200 hidden sm:block" />

            {canApplyRole && (
              <button
                onClick={() => setIsPrepModalOpen(true)}
                disabled={!isApplied}
                className={`${
                  !isApplied
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                } border font-semibold h-11 px-4 sm:px-5 rounded-[5px] text-sm sm:text-base transition-colors flex items-center gap-2`}
                title={
                  !isApplied
                    ? 'Apply to unlock AI Interview Prep'
                    : 'AI Interview Preparation'
                }
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden lg:inline">AI Prep</span>
              </button>
            )}

            <button
              onClick={handleApply}
              disabled={disableApply}
              className={`${
                disableApply
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } font-semibold h-11 px-5 sm:px-6 lg:px-7 rounded-[5px] text-sm sm:text-base transition-colors w-full sm:w-auto`}
              title={
                !user
                  ? 'Sign in to apply'
                  : !canApplyRole
                  ? 'Only candidates can apply'
                  : isApplied
                  ? 'You have already applied'
                  : 'Apply for this job'
              }
            >
              {applyButtonText}
            </button>
          </div>
        </div>
      </div>

      {canApplyRole && (
        <>
          <SubmitApplicationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            job={{
              id: jobId,
              title: jobTitle,
              company: company.name,
              location: address,
              jobType,
              logoUrl: company.logoUrl || undefined,
            }}
          />
          <InterviewPrepModal
            isOpen={isPrepModalOpen}
            onClose={() => setIsPrepModalOpen(false)}
            jobId={jobId}
            jobTitle={jobTitle}
          />
        </>
      )}
    </section>
  );
}
