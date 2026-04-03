'use client';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import JobListSection from '@/components/find-jobs/JobListSection';
import { useState } from 'react';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import { PaginatedJobsResponse } from '@/types/job';


export default function FindJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<PaginatedJobsResponse['jobs'][0]['type'] | undefined>(undefined);
  const [remote, setRemote] = useState<boolean | undefined>(undefined);
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [skills, setSkills] = useState<string[] | undefined>(undefined);
  const [jobs, setJobs] = useState<PaginatedJobsResponse['jobs']>([]);

  const { fetchJobs } = useListJobs();

  const handleSearch = async (term?: string, loc?: string) => {
    const q = term !== undefined ? term : searchTerm;
    const locVal = loc !== undefined ? loc : location;
    setSearchTerm(q);
    setLocation(locVal);
    const query = {
      q,
      location: locVal,
      type,
      remote,
      salaryMin,
      salaryMax,
      skills,
    };
    const result = await fetchJobs(query);
    if (result && result.jobs) setJobs(result.jobs);
  };

  return (
    <>
      <FindJobsHeroSection
        handleSearch={handleSearch}
      />
      <JobListSection
        searchTerm={searchTerm}
        location={location}
      />
    </>
  );
}
