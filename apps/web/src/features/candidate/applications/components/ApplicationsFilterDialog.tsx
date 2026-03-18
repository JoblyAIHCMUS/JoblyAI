'use client';

import { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApplicationFilter } from '@/types/candidate';
import { FilterDraft } from '../types';

type ApplicationsFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterDraft: FilterDraft;
  setFilterDraft: Dispatch<SetStateAction<FilterDraft>>;
  companyOptions: string[];
  jobTypeOptions: string[];
  locationOptions: string[];
  dateRangeLabel: string;
  onApplyFilters: () => void;
  onClearFilters: () => void;
};

export function ApplicationsFilterDialog({
  open,
  onOpenChange,
  filterDraft,
  setFilterDraft,
  companyOptions,
  jobTypeOptions,
  locationOptions,
  dateRangeLabel,
  onApplyFilters,
  onClearFilters,
}: ApplicationsFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Filter Applications</DialogTitle>
          <DialogDescription>
            Refine your applications by status, company, job type, and location.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#25324b]">Status</label>
            <select
              value={filterDraft.status}
              onChange={(event) =>
                setFilterDraft((prev) => ({
                  ...prev,
                  status: event.target.value as ApplicationFilter,
                }))
              }
              className="h-10 rounded-md border border-[#d6ddeb] bg-white px-3 text-sm text-[#25324b]"
            >
              <option value="all">All</option>
              <option value="active">In Review</option>
              <option value="closed">Offered</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#25324b]">
              Company
            </label>
            <select
              value={filterDraft.company}
              onChange={(event) =>
                setFilterDraft((prev) => ({
                  ...prev,
                  company: event.target.value,
                }))
              }
              className="h-10 rounded-md border border-[#d6ddeb] bg-white px-3 text-sm text-[#25324b]"
            >
              <option value="">All companies</option>
              {companyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#25324b]">
                Job Type
              </label>
              <select
                value={filterDraft.jobType}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    jobType: event.target.value,
                  }))
                }
                className="h-10 rounded-md border border-[#d6ddeb] bg-white px-3 text-sm text-[#25324b]"
              >
                <option value="">All job types</option>
                {jobTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#25324b]">
                Location
              </label>
              <select
                value={filterDraft.location}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    location: event.target.value,
                  }))
                }
                className="h-10 rounded-md border border-[#d6ddeb] bg-white px-3 text-sm text-[#25324b]"
              >
                <option value="">All locations</option>
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-md bg-[#f8f8fd] px-3 py-2 text-sm text-[#515b6f]">
            Date filter is already controlled above:{' '}
            <span className="font-medium text-[#25324b]">{dateRangeLabel}</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Clear
          </Button>
          <Button type="button" onClick={onApplyFilters}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
