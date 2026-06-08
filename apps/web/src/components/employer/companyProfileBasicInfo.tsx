'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Building2 } from 'lucide-react';
import {
  SCALE_LABELS,
  INDUSTRY_LABELS,
} from '../../features/employer/company-profile/constants';

export interface CompanyProfileBasicInfoProps {
  name: string;
  logoUrl?: string;
  websiteUrl: string;
  scale: string;
  industry: string;
  isCompanyAdmin?: boolean;
}

export function CompanyProfileBasicInfo({
  name,
  logoUrl,
  websiteUrl,
  scale,
  industry,
  isCompanyAdmin = false,
}: CompanyProfileBasicInfoProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 md:gap-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 md:gap-8 min-w-0 flex-1">
        <div className="shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name + ' logo'}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg sm:rounded-xl object-cover bg-slate-100 border border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg sm:rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="heading-h3-bold truncate text-xl sm:text-2xl md:text-3xl">
              {name}
            </h2>
          </div>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs sm:text-sm block mt-1 truncate"
          >
            {websiteUrl}
          </a>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-8 mt-4">
            {/* Employees */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border border-blue-100 flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:w-7 text-blue-600" />
              </span>
              <div className="flex flex-col">
                <span className="label-label-3-medium text-slate-500 text-xs sm:text-sm">
                  Employees
                </span>
                <span className="heading-h6-bold text-slate-900 text-sm sm:text-base">
                  {SCALE_LABELS[scale] || scale}
                </span>
              </div>
            </div>
            {/* Industry */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border border-blue-100 flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:w-7 text-blue-600" />
              </span>
              <div className="flex flex-col">
                <span className="label-label-3-medium text-slate-500 text-xs sm:text-sm">
                  Industry
                </span>
                <span className="heading-h6-bold text-slate-900 text-sm sm:text-base">
                  {INDUSTRY_LABELS[industry] || industry}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCompanyAdmin && (
        <div className="flex items-center justify-start sm:justify-end w-full sm:w-auto">
          <Link href="/employer/company-profile/edit" passHref>
            <Button
              asChild
              variant="outline"
              className="gap-2 h-9 sm:h-10 text-xs sm:text-sm"
            >
              <span>Profile Settings</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
