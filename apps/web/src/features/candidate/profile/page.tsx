'use client';
import React from 'react';
import ProfileHeader from './components/ProfileHeader';
import AboutMe from './components/AboutMe';
import Experiences from './components/Experiences';
import Educations from './components/Educations';
import Skills from './components/Skills';
import Portfolios from './components/Portfolios';
import SideBar from './components/sideBar';

// Dummy data for layout demo
const candidate = {
  name: 'Jake Gyll',
  title: 'Product Designer at Twitter',
  location: 'Manchester, UK',
  avatar: 'https://placehold.co/140x140',
  banner: '#4640DE',
  openForOpportunities: true,
  about: [
    'I’m a product designer + filmmaker currently working remotely at Twitter from beautiful Manchester, United Kingdom. I’m passionate about designing digital products that have a positive impact on the world.',
    'For 10 years, I’ve specialised in interface, experience & interaction design as well as working in user research and product strategy for product agencies, big tech companies & start-ups.',
  ],
  experiences: [
    {
      company: 'Twitter',
      logo: 'https://placehold.co/80x80',
      role: 'Product Designer',
      type: 'Full-Time',
      time: 'Jun 2019 - Present (1y 1m)',
      location: 'Manchester, UK',
      desc: 'Created and executed social media plan for 10 brands utilizing multiple features and content types to increase brand outreach, engagement, and leads.',
    },
    {
      company: 'GoDaddy',
      logo: 'https://placehold.co/80x80',
      role: 'Growth Marketing Designer',
      type: 'Full-Time',
      time: 'Jun 2011 - May 2019 (8y)',
      location: 'Manchester, UK',
      desc: 'Developed digital marketing strategies, activation plans, proposals, contests and promotions for client initiatives',
    },
  ],
  educations: [
    {
      school: 'Harvard University',
      logo: 'https://placehold.co/80x80',
      degree: 'Postgraduate degree, Applied Psychology',
      time: '2010 - 2012',
      desc: 'As an Applied Psychologist in the field of Consumer and Society, I am specialized in creating business opportunities by observing, analysing, researching and changing behaviour.',
    },
    {
      school: 'University of Toronto',
      logo: 'https://placehold.co/80x80',
      degree: 'Bachelor of Arts, Visual Communication',
      time: '2005 - 2009',
      desc: '---',
    },
  ],
  skills: [
    'Communication',
    'Analytics',
    'Facebook Ads',
    'Content Planning',
    'Community Manager',
  ],
  portfolios: [
    {
      img: 'https://placehold.co/203x152',
      name: 'Clinically - clinic & health care website',
    },
    {
      img: 'https://placehold.co/203x152',
      name: 'Growthly - SaaS Analytics & Sales Website',
    },
    {
      img: 'https://placehold.co/203x152',
      name: 'Planna - Project Management App',
    },
    {
      img: 'https://placehold.co/203x152',
      name: 'Funiro - Landing Page for furniture shop',
    },
  ],
  contact: {
    email: 'jakegyll@email.com',
    phone: '+44 1245 572 135',
  },
  socials: [
    { label: 'Instagram', value: 'instagram.com/jakegyll' },
    { label: 'Twitter', value: 'twitter.com/jakegyll' },
    { label: 'Website', value: 'www.jakegyll.com' },
  ],
};

const CandidateProfilePage = () => {
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
