'use client';
import React from 'react';
import AboutMe from './applicantProfile/AboutMe';
import Experiences from './applicantProfile/Experiences';
import Educations from './applicantProfile/Educations';
import Skills from './applicantProfile/Skills';
import Portfolios from './applicantProfile/Portfolios';

// Dummy data for demonstration; replace with real applicant data as needed
const demoProfile = {
  about: [
    "I'm a product designer + filmmaker currently working remotely at Twitter from beautiful Manchester, United Kingdom. I'm passionate about designing digital products that have a positive impact on the world.",
    "For 10 years, I've specialised in interface, experience & interaction design as well as working in user research and product strategy for product agencies, big tech companies & start-ups.",
  ],
  experiences: [
    {
      company: 'Twitter',
      logo: 'https://placehold.co/80x80',
      role: 'Product Designer',
      type: 'Full-Time',
      time: 'Jun 2019 - Present (1y 1m)',
      location: 'Manchester, UK',
      desc: 'Created and executed social media plan for 10 brands utilizing multiple features and content types to increase brand outreach, engagement, and loads.',
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
};

export default function ApplicantProfile({
  profile = demoProfile,
}: {
  profile?: typeof demoProfile;
}) {
  return (
    <div className="flex flex-col gap-6">
      <AboutMe about={profile.about} />
      <Experiences experiences={profile.experiences} />
      <Educations educations={profile.educations} />
      <Skills skills={profile.skills} />
      <Portfolios portfolios={profile.portfolios} />
    </div>
  );
}
