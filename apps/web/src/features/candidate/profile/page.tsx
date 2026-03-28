'use client';

import { useState, useEffect } from 'react';

import ProfileHeader from './components/ProfileHeader';
import AboutMe from './components/AboutMe';
import Experiences from './components/Experiences';
import Educations from './components/Educations';
import Skills from './components/Skills';
import Portfolios from './components/Portfolios';
import SideBar from './components/sideBar';
import { useGetCandidateProfile } from '@/api-hook/candidate/useGetCandidateProfile';

const CandidateProfilePage = () => {
  const { fetchCandidateProfile, loading, error } = useGetCandidateProfile();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchCandidateProfile().then(setProfile).catch(() => {});
  }, []);

  if (loading || !profile) {
    return <div className="w-full min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="w-full min-h-screen flex items-center justify-center text-red-500">Error loading profile.</div>;
  }

  // Map API data to UI props
  const candidate = {
    name: profile.name,
    title: profile.role || '',
    location: '', // No location in API response
    avatar: profile.image,
    banner: '#4640DE',
    openForOpportunities: true, // Not in API, default true
    about: [profile.email], // No about in API, show email as placeholder
    experiences: (profile.experiences || []).map((exp: any) => ({
      company: exp.companyName || '',
      logo: 'https://placehold.co/80x80', // No logo in API
      role: exp.jobTitle || '',
      type: 'Full-Time', // Not in API
      time: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
      location: exp.location || '',
      desc: exp.description || '',
    })),
    educations: (profile.educations || []).map((edu: any) => ({
      school: edu.school || '',
      logo: 'https://placehold.co/80x80', // No logo in API
      degree: edu.degree || '',
      time: `${edu.startDate || ''} - ${edu.endDate || ''}`,
      desc: edu.description || '',
    })),
    skills: [], // Not in API
    portfolios: [], // Not in API
    contact: {
      email: profile.email,
      phone: '', // Not in API
    },
    socials: [], // Not in API
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] px-6 py-8 flex flex-col items-center">
      <div className="flex flex-row gap-4 w-full max-w-6xl">
        {/* Main Content (Left) */}
        <div className="flex flex-col gap-6 w-[728px]">
          <ProfileHeader candidate={candidate} />
          <AboutMe about={candidate.about} />
          <Experiences experiences={candidate.experiences} />
          <Educations educations={candidate.educations} />
          <Skills skills={candidate.skills} />
          <Portfolios portfolios={candidate.portfolios} />
        </div>
        {/* Sidebar (Right) */}
        <SideBar contact={candidate.contact} socials={candidate.socials} />
      </div>
    </div>
  );
};

export default CandidateProfilePage;
