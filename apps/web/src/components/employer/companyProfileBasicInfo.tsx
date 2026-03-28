import { Button } from '@/components/ui/button';
import { Users, Building2 } from 'lucide-react';
import {
  SCALE_LABELS,
  INDUSTRY_LABELS,
} from '../../features/employer/company-profile/constants';
import * as React from 'react';

export interface CompanyProfileBasicInfoProps {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  scale: string;
  industry: string;
}

export function CompanyProfileBasicInfo({
  name,
  logoUrl,
  websiteUrl,
  scale,
  industry,
}: CompanyProfileBasicInfoProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
      <div className="flex items-center gap-6 min-w-0">
        <div className="shrink-0">
          <img
            src={logoUrl}
            alt={name + ' logo'}
            className="w-28 h-28 rounded-xl object-cover bg-slate-100 border border-slate-200"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold truncate">{name}</h2>
          </div>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm block mt-1 truncate"
          >
            {websiteUrl}
          </a>
          <div className="flex flex-wrap gap-8 mt-4">
            {/* Employees */}
            <div className="flex items-center gap-3 min-w-[120px]">
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-blue-100">
                <Users className="w-7 h-7 text-blue-600" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">
                  Employees
                </span>
                <span className="text-md font-bold text-slate-900">
                  {SCALE_LABELS[scale] || scale}
                </span>
              </div>
            </div>
            {/* Industry */}
            <div className="flex items-center gap-3 min-w-[120px]">
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-blue-100">
                <Building2 className="w-7 h-7 text-blue-600" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">
                  Industry
                </span>
                <span className="text-md font-bold text-slate-900">
                  {INDUSTRY_LABELS[industry] || industry}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button variant="outline" className="gap-2">
          <span>Profile Settings</span>
        </Button>
      </div>
    </div>
  );
}
