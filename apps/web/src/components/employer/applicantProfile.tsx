'use client';
import React from 'react';
import type { CandidateProfileResponse } from '@/api-client/candidate/types';
import type {
  CandidateEducation,
  CandidateExperience,
} from '@/types/candidate';
import AboutMe from './applicantProfile/AboutMe';
import Experiences from './applicantProfile/Experiences';
import Educations from './applicantProfile/Educations';
import Skills from './applicantProfile/Skills';
import Portfolios from './applicantProfile/Portfolios';

export default function ApplicantProfile({
  profile,
}: {
  profile?: CandidateProfileResponse;
}) {
  if (!profile) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-8 text-[var(--text-tertiary)]">
          No profile data available
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AboutMe about={profile.about} />
      <Experiences
        experiences={profile.experiences as CandidateExperience[] | undefined}
      />
      <Educations
        educations={profile.educations as CandidateEducation[] | undefined}
      />
      <Skills skills={profile.skills} />
      <Portfolios portfolios={profile.portfolios} />
    </div>
  );
}
