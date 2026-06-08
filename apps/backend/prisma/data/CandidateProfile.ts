import {
  CandidateContactType,
  CandidateExperienceType,
  CandidateSkillLevel,
  CandidateSocialPlatform,
  Degree,
} from '@prisma/client';

export const candidateProfiles = [
  {
    email: 'sdeadman1@java.com',
    description: {
      title: 'Frontend Developer',
      bio: 'Sherman is a frontend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'PixelCraft Studio',
        jobTitle: 'Frontend Developer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2022-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        issueDate: new Date('2023-05-15'),
        credentialId: 'META-SHERMAN-1',
        url: 'https://example.com/credentials/sherman-deadman',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '570-149-8721',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'sdeadman1@java.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/shermandeadman',
        username: 'shermandeadman',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/sherman-deadman',
        username: 'sherman-deadman',
      },
    ],
  },
  {
    email: 'kthundercliffe2@geocities.jp',
    description: {
      title: 'Backend Developer',
      bio: 'Kristi is a backend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to software engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Da Nang, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior Backend Developer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Node.js Application Developer',
        issuer: 'OpenJS Foundation',
        issueDate: new Date('2011-05-15'),
        credentialId: 'OPENJS-KRISTI-2',
        url: 'https://example.com/credentials/kristi-thundercliffe',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Redis', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '876-282-6255',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'kthundercliffe2@geocities.jp',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/kristithundercliffe',
        username: 'kristithundercliffe',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/kristi-thundercliffe',
        username: 'kristi-thundercliffe',
      },
    ],
  },
  {
    email: 'iquidenham7@stanford.edu',
    description: {
      title: 'Full-Stack Developer',
      bio: 'Ilario is a full-stack developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Science',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to information technology, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'NextWave Labs',
        jobTitle: 'Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Full Stack Web Development',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2010-05-15'),
        credentialId: 'FREECODECAMP-ILARIO-3',
        url: 'https://example.com/credentials/ilario-quidenham',
      },
    ],
    skills: [
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'TypeScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '309-807-8302',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'iquidenham7@stanford.edu',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/ilarioquidenham',
        username: 'ilarioquidenham',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/ilario-quidenham',
        username: 'ilario-quidenham',
      },
    ],
  },
  {
    email: 'tcatanheira9@usgs.gov',
    description: {
      title: 'DevOps Engineer',
      bio: 'Tate is a devops engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Institute of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Engineering',
        startDate: new Date('2021-09-01'),
        endDate: new Date('2025-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to computer engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Cloud Services Ltd.',
        jobTitle: 'DevOps Engineer',
        location: 'Singapore',
        startDate: new Date('2026-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior DevOps Engineer',
        location: 'Remote',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2024-05-15'),
        credentialId: 'AMAZON-TATE-4',
        url: 'https://example.com/credentials/tate-catanheira',
      },
    ],
    skills: [
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Jenkins', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'AWS', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '575-166-0888',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'tcatanheira9@usgs.gov',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/tatecatanheira',
        username: 'tatecatanheira',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/tate-catanheira',
        username: 'tate-catanheira',
      },
    ],
  },
  {
    email: 'cpridiea@feedburner.com',
    description: {
      title: 'Data Analyst',
      bio: 'Concettina is a data analyst with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'National University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Data Analytics',
        startDate: new Date('2014-09-01'),
        endDate: new Date('2018-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to data analytics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Insight Analytics',
        jobTitle: 'Data Analyst',
        location: 'Ha Noi, Vietnam',
        startDate: new Date('2018-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior Data Analyst',
        location: 'Remote',
        startDate: new Date('2016-01-01'),
        endDate: new Date('2018-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2019-05-15'),
        credentialId: 'GOOGLE-CONCETTINA-5',
        url: 'https://example.com/credentials/concettina-pridie',
      },
    ],
    skills: [
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Tableau', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Excel', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Power BI', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '756-995-6313',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'cpridiea@feedburner.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/concettinapridie',
        username: 'concettinapridie',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/concettina-pridie',
        username: 'concettina-pridie',
      },
    ],
  },
  {
    email: 'ygrimmd@blogger.com',
    description: {
      title: 'Data Scientist',
      bio: 'Yuma is a data scientist with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Statistics',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to statistics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Analytics Corp',
        jobTitle: 'Data Scientist',
        location: 'New York, NY',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior Data Scientist',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        issueDate: new Date('2011-05-15'),
        credentialId: 'GOOGLE-YUMA-6',
        url: 'https://example.com/credentials/yuma-grimm',
      },
    ],
    skills: [
      { name: 'Python', level: CandidateSkillLevel.MASTER, years: 7 },
      { name: 'R', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'TensorFlow', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      {
        name: 'Machine Learning',
        level: CandidateSkillLevel.ADVANCED,
        years: 5,
      },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '161-139-5580',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ygrimmd@blogger.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/yumagrimm',
        username: 'yumagrimm',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/yuma-grimm',
        username: 'yuma-grimm',
      },
    ],
  },
  {
    email: 'dpourveerf@eventbrite.com',
    description: {
      title: 'UI/UX Designer',
      bio: 'Dudley is a ui/ux designer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'International University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Digital Design',
        startDate: new Date('2011-09-01'),
        endDate: new Date('2015-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to digital design, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Design Studios',
        jobTitle: 'UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2015-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2013-01-01'),
        endDate: new Date('2015-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2016-05-15'),
        credentialId: 'GOOGLE-DUDLEY-7',
        url: 'https://example.com/credentials/dudley-pourveer',
      },
    ],
    skills: [
      { name: 'Figma', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Adobe XD', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Sketch', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      {
        name: 'User Research',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 2,
      },
      { name: 'Prototyping', level: CandidateSkillLevel.ADVANCED, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '805-406-0743',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'dpourveerf@eventbrite.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/dudleypourveer',
        username: 'dudleypourveer',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/dudley-pourveer',
        username: 'dudley-pourveer',
      },
    ],
  },
  {
    email: 'lchavring@google.co.uk',
    description: {
      title: 'QA Engineer',
      bio: 'Lola is a qa engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Systems',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to information systems, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'QualityWorks',
        jobTitle: 'QA Engineer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Innovation Labs',
        jobTitle: 'Junior QA Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'ISTQB Certified Tester Foundation Level',
        issuer: 'ASTQB',
        issueDate: new Date('2011-05-15'),
        credentialId: 'ASTQB-LOLA-8',
        url: 'https://example.com/credentials/lola-chavrin',
      },
    ],
    skills: [
      { name: 'Cypress', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Jest', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'JavaScript', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Selenium', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'SQL', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '725-427-5554',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'lchavring@google.co.uk',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/lolachavrin',
        username: 'lolachavrin',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/lola-chavrin',
        username: 'lola-chavrin',
      },
    ],
  },
  {
    email: 'sbesnardeauh@technorati.com',
    description: {
      title: 'Mobile Developer',
      bio: 'Shawna is a mobile developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Polytechnic University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Mobile Application Development',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to mobile application development, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'AppFactory',
        jobTitle: 'Mobile Developer',
        location: 'Tokyo, Japan',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior Mobile Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'App Development with Swift Certification',
        issuer: 'Apple',
        issueDate: new Date('2010-05-15'),
        credentialId: 'APPLE-SHAWNA-9',
        url: 'https://example.com/credentials/shawna-besnardeau',
      },
    ],
    skills: [
      { name: 'Swift', level: CandidateSkillLevel.ADVANCED, years: 5 },
      {
        name: 'React Native',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 4,
      },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Firebase', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Kotlin', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '709-442-9869',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'sbesnardeauh@technorati.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/shawnabesnardeau',
        username: 'shawnabesnardeau',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/shawna-besnardeau',
        username: 'shawna-besnardeau',
      },
    ],
  },
  {
    email: 'growlesi@archive.org',
    description: {
      title: 'Cloud Backend Engineer',
      bio: 'Garvin is a cloud backend engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'CloudStack',
        jobTitle: 'Cloud Backend Engineer',
        location: 'Seattle, WA',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior Cloud Backend Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Cloud Professional Cloud Developer',
        issuer: 'Google Cloud',
        issueDate: new Date('2011-05-15'),
        credentialId: 'GOOGLE-GARVIN-10',
        url: 'https://example.com/credentials/garvin-rowles',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'AWS', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '214-473-8251',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'growlesi@archive.org',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/garvinrowles',
        username: 'garvinrowles',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/garvin-rowles',
        username: 'garvin-rowles',
      },
    ],
  },
  {
    email: 'pstonnellj@ftc.gov',
    description: {
      title: 'Frontend Developer',
      bio: 'Pearla is a frontend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'PixelCraft Studio',
        jobTitle: 'Frontend Developer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2022-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        issueDate: new Date('2023-05-15'),
        credentialId: 'META-PEARLA-11',
        url: 'https://example.com/credentials/pearla-stonnell',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 5 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '227-567-7400',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'pstonnellj@ftc.gov',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/pearlastonnell',
        username: 'pearlastonnell',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/pearla-stonnell',
        username: 'pearla-stonnell',
      },
    ],
  },
  {
    email: 'astanionk@ibm.com',
    description: {
      title: 'Backend Developer',
      bio: 'Arel is a backend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Science',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to software engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Da Nang, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior Backend Developer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Node.js Application Developer',
        issuer: 'OpenJS Foundation',
        issueDate: new Date('2011-05-15'),
        credentialId: 'OPENJS-AREL-12',
        url: 'https://example.com/credentials/arel-stanion',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'Redis', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '103-453-1634',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'astanionk@ibm.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/arelstanion',
        username: 'arelstanion',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/arel-stanion',
        username: 'arel-stanion',
      },
    ],
  },
  {
    email: 'tolennikovm@elpais.com',
    description: {
      title: 'Full-Stack Developer',
      bio: 'Tully is a full-stack developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Institute of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to information technology, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'NextWave Labs',
        jobTitle: 'Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Full Stack Web Development',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2010-05-15'),
        credentialId: 'FREECODECAMP-TULLY-13',
        url: 'https://example.com/credentials/tully-olennikov',
      },
    ],
    skills: [
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'TypeScript', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '165-955-2186',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'tolennikovm@elpais.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/tullyolennikov',
        username: 'tullyolennikov',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/tully-olennikov',
        username: 'tully-olennikov',
      },
    ],
  },
  {
    email: 'fstallionn@cdbaby.com',
    description: {
      title: 'DevOps Engineer',
      bio: 'Fanya is a devops engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'National University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to computer engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Cloud Services Ltd.',
        jobTitle: 'DevOps Engineer',
        location: 'Singapore',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior DevOps Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2011-05-15'),
        credentialId: 'AMAZON-FANYA-14',
        url: 'https://example.com/credentials/fanya-stallion',
      },
    ],
    skills: [
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Jenkins', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'AWS', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '276-772-9550',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'fstallionn@cdbaby.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/fanyastallion',
        username: 'fanyastallion',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/fanya-stallion',
        username: 'fanya-stallion',
      },
    ],
  },
  {
    email: 'lroskelleyo@histats.com',
    description: {
      title: 'Data Analyst',
      bio: 'Lazaro is a data analyst with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Data Analytics',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to data analytics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Insight Analytics',
        jobTitle: 'Data Analyst',
        location: 'Ha Noi, Vietnam',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior Data Analyst',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2010-05-15'),
        credentialId: 'GOOGLE-LAZARO-15',
        url: 'https://example.com/credentials/lazaro-roskelley',
      },
    ],
    skills: [
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Tableau', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Excel', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'Power BI', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '674-764-0206',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'lroskelleyo@histats.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/lazaroroskelley',
        username: 'lazaroroskelley',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/lazaro-roskelley',
        username: 'lazaro-roskelley',
      },
    ],
  },
  {
    email: 'ztrinkep@cdc.gov',
    description: {
      title: 'Data Scientist',
      bio: 'Zea is a data scientist with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'International University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Statistics',
        startDate: new Date('2008-09-01'),
        endDate: new Date('2012-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to statistics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Analytics Corp',
        jobTitle: 'Data Scientist',
        location: 'New York, NY',
        startDate: new Date('2013-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Innovation Labs',
        jobTitle: 'Junior Data Scientist',
        location: 'Remote',
        startDate: new Date('2011-01-01'),
        endDate: new Date('2013-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        issueDate: new Date('2014-05-15'),
        credentialId: 'GOOGLE-ZEA-16',
        url: 'https://example.com/credentials/zea-trinke',
      },
    ],
    skills: [
      { name: 'Python', level: CandidateSkillLevel.MASTER, years: 5 },
      { name: 'R', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'TensorFlow', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      {
        name: 'Machine Learning',
        level: CandidateSkillLevel.ADVANCED,
        years: 3,
      },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '595-261-3229',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ztrinkep@cdc.gov',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/zeatrinke',
        username: 'zeatrinke',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/zea-trinke',
        username: 'zea-trinke',
      },
    ],
  },
  {
    email: 'bodroughtq@hatena.ne.jp',
    description: {
      title: 'UI/UX Designer',
      bio: 'Beverlee is a ui/ux designer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Digital Design',
        startDate: new Date('2012-09-01'),
        endDate: new Date('2016-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to digital design, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Design Studios',
        jobTitle: 'UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2016-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2014-01-01'),
        endDate: new Date('2016-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2017-05-15'),
        credentialId: 'GOOGLE-BEVERLEE-17',
        url: 'https://example.com/credentials/beverlee-o-drought',
      },
    ],
    skills: [
      { name: 'Figma', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Adobe XD', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Sketch', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      {
        name: 'User Research',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 3,
      },
      { name: 'Prototyping', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '643-747-4534',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'bodroughtq@hatena.ne.jp',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/beverleeodrought',
        username: 'beverleeodrought',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/beverlee-o-drought',
        username: 'beverlee-o-drought',
      },
    ],
  },
  {
    email: 'chelstripr@studiopress.com',
    description: {
      title: 'QA Engineer',
      bio: 'Chiarra is a qa engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Polytechnic University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Systems',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to information systems, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'QualityWorks',
        jobTitle: 'QA Engineer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior QA Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'ISTQB Certified Tester Foundation Level',
        issuer: 'ASTQB',
        issueDate: new Date('2011-05-15'),
        credentialId: 'ASTQB-CHIARRA-18',
        url: 'https://example.com/credentials/chiarra-helstrip',
      },
    ],
    skills: [
      { name: 'Cypress', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Jest', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'JavaScript', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Selenium', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'SQL', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '931-915-4952',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'chelstripr@studiopress.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/chiarrahelstrip',
        username: 'chiarrahelstrip',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/chiarra-helstrip',
        username: 'chiarra-helstrip',
      },
    ],
  },
  {
    email: 'ndentiths@tamu.edu',
    description: {
      title: 'Mobile Developer',
      bio: 'Noak is a mobile developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Mobile Application Development',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to mobile application development, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'AppFactory',
        jobTitle: 'Mobile Developer',
        location: 'Tokyo, Japan',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior Mobile Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'App Development with Swift Certification',
        issuer: 'Apple',
        issueDate: new Date('2010-05-15'),
        credentialId: 'APPLE-NOAK-19',
        url: 'https://example.com/credentials/noak-dentith',
      },
    ],
    skills: [
      { name: 'Swift', level: CandidateSkillLevel.ADVANCED, years: 3 },
      {
        name: 'React Native',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 2,
      },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Firebase', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'Kotlin', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '864-984-8537',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ndentiths@tamu.edu',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/noakdentith',
        username: 'noakdentith',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/noak-dentith',
        username: 'noak-dentith',
      },
    ],
  },
  {
    email: 'acheeseu@prlog.org',
    description: {
      title: 'Cloud Backend Engineer',
      bio: 'Anett is a cloud backend engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'CloudStack',
        jobTitle: 'Cloud Backend Engineer',
        location: 'Seattle, WA',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior Cloud Backend Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Cloud Professional Cloud Developer',
        issuer: 'Google Cloud',
        issueDate: new Date('2011-05-15'),
        credentialId: 'GOOGLE-ANETT-20',
        url: 'https://example.com/credentials/anett-cheese',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'AWS', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '456-481-1137',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'acheeseu@prlog.org',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/anettcheese',
        username: 'anettcheese',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/anett-cheese',
        username: 'anett-cheese',
      },
    ],
  },
  {
    email: 'bmeasorw@ning.com',
    description: {
      title: 'Frontend Developer',
      bio: 'Bo is a frontend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Science',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'PixelCraft Studio',
        jobTitle: 'Frontend Developer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        issueDate: new Date('2010-05-15'),
        credentialId: 'META-BO-21',
        url: 'https://example.com/credentials/bo-measor',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 6 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '562-554-8381',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'bmeasorw@ning.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/bomeasor',
        username: 'bomeasor',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/bo-measor',
        username: 'bo-measor',
      },
    ],
  },
  {
    email: 'gtynemouthx@facebook.com',
    description: {
      title: 'Backend Developer',
      bio: 'Geoffrey is a backend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Institute of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to software engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Da Nang, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior Backend Developer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Node.js Application Developer',
        issuer: 'OpenJS Foundation',
        issueDate: new Date('2011-05-15'),
        credentialId: 'OPENJS-GEOFFREY-22',
        url: 'https://example.com/credentials/geoffrey-tynemouth',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Redis', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '178-661-3993',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'gtynemouthx@facebook.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/geoffreytynemouth',
        username: 'geoffreytynemouth',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/geoffrey-tynemouth',
        username: 'geoffrey-tynemouth',
      },
    ],
  },
  {
    email: 'alawleffy@aboutads.info',
    description: {
      title: 'Full-Stack Developer',
      bio: 'Audra is a full-stack developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'National University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to information technology, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'NextWave Labs',
        jobTitle: 'Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Full Stack Web Development',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2010-05-15'),
        credentialId: 'FREECODECAMP-AUDRA-23',
        url: 'https://example.com/credentials/audra-lawleff',
      },
    ],
    skills: [
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'TypeScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '540-283-4483',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'alawleffy@aboutads.info',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/audralawleff',
        username: 'audralawleff',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/audra-lawleff',
        username: 'audra-lawleff',
      },
    ],
  },
  {
    email: 'csiddon10@is.gd',
    description: {
      title: 'DevOps Engineer',
      bio: 'Constantine is a devops engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Engineering',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to computer engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Cloud Services Ltd.',
        jobTitle: 'DevOps Engineer',
        location: 'Singapore',
        startDate: new Date('2022-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Innovation Labs',
        jobTitle: 'Junior DevOps Engineer',
        location: 'Remote',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2023-05-15'),
        credentialId: 'AMAZON-CONSTANTINE-24',
        url: 'https://example.com/credentials/constantine-siddon',
      },
    ],
    skills: [
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Jenkins', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'AWS', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '706-865-9719',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'csiddon10@is.gd',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/constantinesiddon',
        username: 'constantinesiddon',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/constantine-siddon',
        username: 'constantine-siddon',
      },
    ],
  },
  {
    email: 'lbiggadike11@wikimedia.org',
    description: {
      title: 'Data Analyst',
      bio: 'Lil is a data analyst with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'International University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Data Analytics',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to data analytics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Insight Analytics',
        jobTitle: 'Data Analyst',
        location: 'Ha Noi, Vietnam',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior Data Analyst',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2010-05-15'),
        credentialId: 'GOOGLE-LIL-25',
        url: 'https://example.com/credentials/lil-biggadike',
      },
    ],
    skills: [
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Tableau', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'Excel', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Power BI', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '426-878-1791',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'lbiggadike11@wikimedia.org',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/lilbiggadike',
        username: 'lilbiggadike',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/lil-biggadike',
        username: 'lil-biggadike',
      },
    ],
  },
  {
    email: 'fbolderoe12@nasa.gov',
    description: {
      title: 'Data Scientist',
      bio: 'Felicio is a data scientist with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.MASTER,
        fieldOfStudy: 'Statistics',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to statistics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Analytics Corp',
        jobTitle: 'Data Scientist',
        location: 'New York, NY',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior Data Scientist',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        issueDate: new Date('2011-05-15'),
        credentialId: 'GOOGLE-FELICIO-26',
        url: 'https://example.com/credentials/felicio-bolderoe',
      },
    ],
    skills: [
      { name: 'Python', level: CandidateSkillLevel.MASTER, years: 6 },
      { name: 'R', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'TensorFlow', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      {
        name: 'Machine Learning',
        level: CandidateSkillLevel.ADVANCED,
        years: 4,
      },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '416-429-8524',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'fbolderoe12@nasa.gov',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/feliciobolderoe',
        username: 'feliciobolderoe',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/felicio-bolderoe',
        username: 'felicio-bolderoe',
      },
    ],
  },
  {
    email: 'tbaukham19@harvard.edu',
    description: {
      title: 'UI/UX Designer',
      bio: 'Trefor is a ui/ux designer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Polytechnic University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Digital Design',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to digital design, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Design Studios',
        jobTitle: 'UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2010-05-15'),
        credentialId: 'GOOGLE-TREFOR-27',
        url: 'https://example.com/credentials/trefor-baukham',
      },
    ],
    skills: [
      { name: 'Figma', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Adobe XD', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Sketch', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      {
        name: 'User Research',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 4,
      },
      { name: 'Prototyping', level: CandidateSkillLevel.ADVANCED, years: 5 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '966-890-1168',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'tbaukham19@harvard.edu',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/treforbaukham',
        username: 'treforbaukham',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/trefor-baukham',
        username: 'trefor-baukham',
      },
    ],
  },
  {
    email: 'dogley1a@technorati.com',
    description: {
      title: 'QA Engineer',
      bio: 'Deina is a qa engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Systems',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to information systems, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'QualityWorks',
        jobTitle: 'QA Engineer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior QA Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'ISTQB Certified Tester Foundation Level',
        issuer: 'ASTQB',
        issueDate: new Date('2011-05-15'),
        credentialId: 'ASTQB-DEINA-28',
        url: 'https://example.com/credentials/deina-ogley',
      },
    ],
    skills: [
      { name: 'Cypress', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Jest', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'JavaScript', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Selenium', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'SQL', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '187-251-8129',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'dogley1a@technorati.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/deinaogley',
        username: 'deinaogley',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/deina-ogley',
        username: 'deina-ogley',
      },
    ],
  },
  {
    email: 'jrosewarne1b@amazon.com',
    description: {
      title: 'Mobile Developer',
      bio: 'Janine is a mobile developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Mobile Application Development',
        startDate: new Date('2013-09-01'),
        endDate: new Date('2017-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to mobile application development, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'AppFactory',
        jobTitle: 'Mobile Developer',
        location: 'Tokyo, Japan',
        startDate: new Date('2017-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior Mobile Developer',
        location: 'Remote',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2017-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'App Development with Swift Certification',
        issuer: 'Apple',
        issueDate: new Date('2018-05-15'),
        credentialId: 'APPLE-JANINE-29',
        url: 'https://example.com/credentials/janine-rosewarne',
      },
    ],
    skills: [
      { name: 'Swift', level: CandidateSkillLevel.ADVANCED, years: 4 },
      {
        name: 'React Native',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 3,
      },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Firebase', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Kotlin', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '565-172-6138',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'jrosewarne1b@amazon.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/janinerosewarne',
        username: 'janinerosewarne',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/janine-rosewarne',
        username: 'janine-rosewarne',
      },
    ],
  },
  {
    email: 'rbattrick1c@squarespace.com',
    description: {
      title: 'Cloud Backend Engineer',
      bio: 'Retha is a cloud backend engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Science',
        degree: Degree.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2014-09-01'),
        endDate: new Date('2018-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'CloudStack',
        jobTitle: 'Cloud Backend Engineer',
        location: 'Seattle, WA',
        startDate: new Date('2019-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior Cloud Backend Engineer',
        location: 'Remote',
        startDate: new Date('2017-01-01'),
        endDate: new Date('2019-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Cloud Professional Cloud Developer',
        issuer: 'Google Cloud',
        issueDate: new Date('2020-05-15'),
        credentialId: 'GOOGLE-RETHA-30',
        url: 'https://example.com/credentials/retha-battrick',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'AWS', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '352-911-9776',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'rbattrick1c@squarespace.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/rethabattrick',
        username: 'rethabattrick',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/retha-battrick',
        username: 'retha-battrick',
      },
    ],
  },
  {
    email: 'ebrandenburg1d@wired.com',
    description: {
      title: 'Frontend Developer',
      bio: 'Erek is a frontend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Institute of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'PixelCraft Studio',
        jobTitle: 'Frontend Developer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        issueDate: new Date('2010-05-15'),
        credentialId: 'META-EREK-31',
        url: 'https://example.com/credentials/erek-brandenburg',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '197-968-7837',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ebrandenburg1d@wired.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/erekbrandenburg',
        username: 'erekbrandenburg',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/erek-brandenburg',
        username: 'erek-brandenburg',
      },
    ],
  },
  {
    email: 'dbanner1e@oakley.com',
    description: {
      title: 'Backend Developer',
      bio: 'Dav is a backend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'National University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2021-09-01'),
        endDate: new Date('2025-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to software engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Da Nang, Vietnam',
        startDate: new Date('2026-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Innovation Labs',
        jobTitle: 'Junior Backend Developer',
        location: 'Remote',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Node.js Application Developer',
        issuer: 'OpenJS Foundation',
        issueDate: new Date('2024-05-15'),
        credentialId: 'OPENJS-DAV-32',
        url: 'https://example.com/credentials/dav-banner',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Redis', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '268-838-6326',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'dbanner1e@oakley.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/davbanner',
        username: 'davbanner',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/dav-banner',
        username: 'dav-banner',
      },
    ],
  },
  {
    email: 'kshevill1f@friendfeed.com',
    description: {
      title: 'Full-Stack Developer',
      bio: 'Kattie is a full-stack developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2021-09-01'),
        endDate: new Date('2025-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to information technology, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'NextWave Labs',
        jobTitle: 'Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2025-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Full Stack Web Development',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2024-05-15'),
        credentialId: 'FREECODECAMP-KATTIE-33',
        url: 'https://example.com/credentials/kattie-shevill',
      },
    ],
    skills: [
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'TypeScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '335-185-3913',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'kshevill1f@friendfeed.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/kattieshevill',
        username: 'kattieshevill',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/kattie-shevill',
        username: 'kattie-shevill',
      },
    ],
  },
  {
    email: 'nklimek1g@etsy.com',
    description: {
      title: 'DevOps Engineer',
      bio: 'Nevin is a devops engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'International University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Engineering',
        startDate: new Date('2008-09-01'),
        endDate: new Date('2012-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to computer engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Cloud Services Ltd.',
        jobTitle: 'DevOps Engineer',
        location: 'Singapore',
        startDate: new Date('2013-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior DevOps Engineer',
        location: 'Remote',
        startDate: new Date('2011-01-01'),
        endDate: new Date('2013-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2014-05-15'),
        credentialId: 'AMAZON-NEVIN-34',
        url: 'https://example.com/credentials/nevin-klimek',
      },
    ],
    skills: [
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Jenkins', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'AWS', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '419-525-4522',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'nklimek1g@etsy.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/nevinklimek',
        username: 'nevinklimek',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/nevin-klimek',
        username: 'nevin-klimek',
      },
    ],
  },
  {
    email: 'bleiden1j@chron.com',
    description: {
      title: 'Data Analyst',
      bio: 'Brunhilda is a data analyst with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Data Analytics',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to data analytics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Insight Analytics',
        jobTitle: 'Data Analyst',
        location: 'Ha Noi, Vietnam',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior Data Analyst',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2010-05-15'),
        credentialId: 'GOOGLE-BRUNHILDA-35',
        url: 'https://example.com/credentials/brunhilda-leiden',
      },
    ],
    skills: [
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Tableau', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Excel', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Power BI', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '531-468-9075',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'bleiden1j@chron.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/brunhildaleiden',
        username: 'brunhildaleiden',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/brunhilda-leiden',
        username: 'brunhilda-leiden',
      },
    ],
  },
  {
    email: 'mshelmerdine1k@histats.com',
    description: {
      title: 'Data Scientist',
      bio: 'Mia is a data scientist with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Polytechnic University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Statistics',
        startDate: new Date('2012-09-01'),
        endDate: new Date('2016-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to statistics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Analytics Corp',
        jobTitle: 'Data Scientist',
        location: 'New York, NY',
        startDate: new Date('2017-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior Data Scientist',
        location: 'Remote',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2017-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        issueDate: new Date('2018-05-15'),
        credentialId: 'GOOGLE-MIA-36',
        url: 'https://example.com/credentials/mia-shelmerdine',
      },
    ],
    skills: [
      { name: 'Python', level: CandidateSkillLevel.MASTER, years: 7 },
      { name: 'R', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'TensorFlow', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      {
        name: 'Machine Learning',
        level: CandidateSkillLevel.ADVANCED,
        years: 5,
      },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '487-199-3466',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'mshelmerdine1k@histats.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/miashelmerdine',
        username: 'miashelmerdine',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/mia-shelmerdine',
        username: 'mia-shelmerdine',
      },
    ],
  },
  {
    email: 'aerie1l@bigcartel.com',
    description: {
      title: 'UI/UX Designer',
      bio: 'Anette is a ui/ux designer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Digital Design',
        startDate: new Date('2021-09-01'),
        endDate: new Date('2025-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to digital design, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Design Studios',
        jobTitle: 'UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2025-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2024-05-15'),
        credentialId: 'GOOGLE-ANETTE-37',
        url: 'https://example.com/credentials/anette-erie',
      },
    ],
    skills: [
      { name: 'Figma', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Adobe XD', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Sketch', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      {
        name: 'User Research',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 2,
      },
      { name: 'Prototyping', level: CandidateSkillLevel.ADVANCED, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '409-591-6526',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'aerie1l@bigcartel.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/anetteerie',
        username: 'anetteerie',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/anette-erie',
        username: 'anette-erie',
      },
    ],
  },
  {
    email: 'ssoffe1m@cam.ac.uk',
    description: {
      title: 'QA Engineer',
      bio: 'Shurlock is a qa engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Systems',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to information systems, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'QualityWorks',
        jobTitle: 'QA Engineer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior QA Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'ISTQB Certified Tester Foundation Level',
        issuer: 'ASTQB',
        issueDate: new Date('2011-05-15'),
        credentialId: 'ASTQB-SHURLOCK-38',
        url: 'https://example.com/credentials/shurlock-soffe',
      },
    ],
    skills: [
      { name: 'Cypress', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Jest', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'JavaScript', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Selenium', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'SQL', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '433-335-4352',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ssoffe1m@cam.ac.uk',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/shurlocksoffe',
        username: 'shurlocksoffe',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/shurlock-soffe',
        username: 'shurlock-soffe',
      },
    ],
  },
  {
    email: 'mbrognot1n@house.gov',
    description: {
      title: 'Mobile Developer',
      bio: 'Magnum is a mobile developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Science',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Mobile Application Development',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to mobile application development, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'AppFactory',
        jobTitle: 'Mobile Developer',
        location: 'Tokyo, Japan',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior Mobile Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'App Development with Swift Certification',
        issuer: 'Apple',
        issueDate: new Date('2010-05-15'),
        credentialId: 'APPLE-MAGNUM-39',
        url: 'https://example.com/credentials/magnum-brognot',
      },
    ],
    skills: [
      { name: 'Swift', level: CandidateSkillLevel.ADVANCED, years: 5 },
      {
        name: 'React Native',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 4,
      },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Firebase', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Kotlin', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '350-581-1493',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'mbrognot1n@house.gov',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/magnumbrognot',
        username: 'magnumbrognot',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/magnum-brognot',
        username: 'magnum-brognot',
      },
    ],
  },
  {
    email: 'tskeel1o@gov.uk',
    description: {
      title: 'Cloud Backend Engineer',
      bio: 'Theresita is a cloud backend engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Institute of Technology',
        degree: Degree.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2024-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'CloudStack',
        jobTitle: 'Cloud Backend Engineer',
        location: 'Seattle, WA',
        startDate: new Date('2025-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Innovation Labs',
        jobTitle: 'Junior Cloud Backend Engineer',
        location: 'Remote',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Cloud Professional Cloud Developer',
        issuer: 'Google Cloud',
        issueDate: new Date('2024-05-15'),
        credentialId: 'GOOGLE-THERESITA-40',
        url: 'https://example.com/credentials/theresita-skeel',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'AWS', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '594-462-2808',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'tskeel1o@gov.uk',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/theresitaskeel',
        username: 'theresitaskeel',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/theresita-skeel',
        username: 'theresita-skeel',
      },
    ],
  },
  {
    email: 'hchasen1p@wsj.com',
    description: {
      title: 'Frontend Developer',
      bio: 'Henka is a frontend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'National University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'PixelCraft Studio',
        jobTitle: 'Frontend Developer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        issueDate: new Date('2010-05-15'),
        credentialId: 'META-HENKA-41',
        url: 'https://example.com/credentials/henka-chasen',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 5 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '351-866-0201',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'hchasen1p@wsj.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/henkachasen',
        username: 'henkachasen',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/henka-chasen',
        username: 'henka-chasen',
      },
    ],
  },
  {
    email: 'mgrowcock1r@surveymonkey.com',
    description: {
      title: 'Backend Developer',
      bio: 'Mandi is a backend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to software engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Da Nang, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior Backend Developer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Node.js Application Developer',
        issuer: 'OpenJS Foundation',
        issueDate: new Date('2011-05-15'),
        credentialId: 'OPENJS-MANDI-42',
        url: 'https://example.com/credentials/mandi-growcock',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'Redis', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '980-341-9693',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'mgrowcock1r@surveymonkey.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/mandigrowcock',
        username: 'mandigrowcock',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/mandi-growcock',
        username: 'mandi-growcock',
      },
    ],
  },
  {
    email: 'floan1u@over-blog.com',
    description: {
      title: 'Full-Stack Developer',
      bio: 'Flinn is a full-stack developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'International University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to information technology, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'NextWave Labs',
        jobTitle: 'Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2009-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2007-01-01'),
        endDate: new Date('2009-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Full Stack Web Development',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2010-05-15'),
        credentialId: 'FREECODECAMP-FLINN-43',
        url: 'https://example.com/credentials/flinn-loan',
      },
    ],
    skills: [
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'TypeScript', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '358-429-8812',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'floan1u@over-blog.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/flinnloan',
        username: 'flinnloan',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/flinn-loan',
        username: 'flinn-loan',
      },
    ],
  },
  {
    email: 'jdevenish1v@walmart.com',
    description: {
      title: 'DevOps Engineer',
      bio: 'Jules is a devops engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to computer engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Cloud Services Ltd.',
        jobTitle: 'DevOps Engineer',
        location: 'Singapore',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior DevOps Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2011-05-15'),
        credentialId: 'AMAZON-JULES-44',
        url: 'https://example.com/credentials/jules-devenish',
      },
    ],
    skills: [
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Jenkins', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'AWS', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '992-559-6491',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'jdevenish1v@walmart.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/julesdevenish',
        username: 'julesdevenish',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/jules-devenish',
        username: 'jules-devenish',
      },
    ],
  },
  {
    email: 'alarmouth1x@wisc.edu',
    description: {
      title: 'Data Analyst',
      bio: 'Alyda is a data analyst with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Polytechnic University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Data Analytics',
        startDate: new Date('2008-09-01'),
        endDate: new Date('2012-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to data analytics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Insight Analytics',
        jobTitle: 'Data Analyst',
        location: 'Ha Noi, Vietnam',
        startDate: new Date('2012-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior Data Analyst',
        location: 'Remote',
        startDate: new Date('2010-01-01'),
        endDate: new Date('2012-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2013-05-15'),
        credentialId: 'GOOGLE-ALYDA-45',
        url: 'https://example.com/credentials/alyda-larmouth',
      },
    ],
    skills: [
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Tableau', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Excel', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'Power BI', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '307-705-9081',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'alarmouth1x@wisc.edu',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/alydalarmouth',
        username: 'alydalarmouth',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/alyda-larmouth',
        username: 'alyda-larmouth',
      },
    ],
  },
  {
    email: 'rmears1y@qq.com',
    description: {
      title: 'Data Scientist',
      bio: 'Rey is a data scientist with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.MASTER,
        fieldOfStudy: 'Statistics',
        startDate: new Date('2008-09-01'),
        endDate: new Date('2012-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to statistics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Analytics Corp',
        jobTitle: 'Data Scientist',
        location: 'New York, NY',
        startDate: new Date('2013-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior Data Scientist',
        location: 'Remote',
        startDate: new Date('2011-01-01'),
        endDate: new Date('2013-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        issueDate: new Date('2014-05-15'),
        credentialId: 'GOOGLE-REY-46',
        url: 'https://example.com/credentials/rey-mears',
      },
    ],
    skills: [
      { name: 'Python', level: CandidateSkillLevel.MASTER, years: 5 },
      { name: 'R', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'TensorFlow', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      {
        name: 'Machine Learning',
        level: CandidateSkillLevel.ADVANCED,
        years: 3,
      },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '664-449-2777',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'rmears1y@qq.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/reymears',
        username: 'reymears',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/rey-mears',
        username: 'rey-mears',
      },
    ],
  },
  {
    email: 'wmobius21@people.com.cn',
    description: {
      title: 'UI/UX Designer',
      bio: 'Willy is a ui/ux designer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Digital Design',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2024-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to digital design, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Design Studios',
        jobTitle: 'UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2024-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2024-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2024-05-15'),
        credentialId: 'GOOGLE-WILLY-47',
        url: 'https://example.com/credentials/willy-mobius',
      },
    ],
    skills: [
      { name: 'Figma', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Adobe XD', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'Sketch', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      {
        name: 'User Research',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 3,
      },
      { name: 'Prototyping', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '651-575-3857',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'wmobius21@people.com.cn',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/willymobius',
        username: 'willymobius',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/willy-mobius',
        username: 'willy-mobius',
      },
    ],
  },
  {
    email: 'mstalf22@bing.com',
    description: {
      title: 'QA Engineer',
      bio: 'Marysa is a qa engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Science',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Systems',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to information systems, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'QualityWorks',
        jobTitle: 'QA Engineer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Innovation Labs',
        jobTitle: 'Junior QA Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'ISTQB Certified Tester Foundation Level',
        issuer: 'ASTQB',
        issueDate: new Date('2011-05-15'),
        credentialId: 'ASTQB-MARYSA-48',
        url: 'https://example.com/credentials/marysa-stalf',
      },
    ],
    skills: [
      { name: 'Cypress', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Jest', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'JavaScript', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Selenium', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'SQL', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '489-132-5749',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'mstalf22@bing.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/marysastalf',
        username: 'marysastalf',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/marysa-stalf',
        username: 'marysa-stalf',
      },
    ],
  },
  {
    email: 'kfackrell24@npr.org',
    description: {
      title: 'Mobile Developer',
      bio: 'Kelcey is a mobile developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Institute of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Mobile Application Development',
        startDate: new Date('2007-09-01'),
        endDate: new Date('2011-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to mobile application development, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'AppFactory',
        jobTitle: 'Mobile Developer',
        location: 'Tokyo, Japan',
        startDate: new Date('2011-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior Mobile Developer',
        location: 'Remote',
        startDate: new Date('2009-01-01'),
        endDate: new Date('2011-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'App Development with Swift Certification',
        issuer: 'Apple',
        issueDate: new Date('2012-05-15'),
        credentialId: 'APPLE-KELCEY-49',
        url: 'https://example.com/credentials/kelcey-fackrell',
      },
    ],
    skills: [
      { name: 'Swift', level: CandidateSkillLevel.ADVANCED, years: 3 },
      {
        name: 'React Native',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 2,
      },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Firebase', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'Kotlin', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '806-337-7230',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'kfackrell24@npr.org',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/kelceyfackrell',
        username: 'kelceyfackrell',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/kelcey-fackrell',
        username: 'kelcey-fackrell',
      },
    ],
  },
  {
    email: 'adameisele27@vk.com',
    description: {
      title: 'Cloud Backend Engineer',
      bio: 'Andrea is a cloud backend engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'National University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2016-09-01'),
        endDate: new Date('2020-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'CloudStack',
        jobTitle: 'Cloud Backend Engineer',
        location: 'Seattle, WA',
        startDate: new Date('2021-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior Cloud Backend Engineer',
        location: 'Remote',
        startDate: new Date('2019-01-01'),
        endDate: new Date('2021-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Cloud Professional Cloud Developer',
        issuer: 'Google Cloud',
        issueDate: new Date('2022-05-15'),
        credentialId: 'GOOGLE-ANDREA-50',
        url: 'https://example.com/credentials/andrea-dameisele',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'AWS', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '912-851-5076',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'adameisele27@vk.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/andreadameisele',
        username: 'andreadameisele',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/andrea-dameisele',
        username: 'andrea-dameisele',
      },
    ],
  },
  {
    email: 'ganthill28@reuters.com',
    description: {
      title: 'Frontend Developer',
      bio: 'Gabriel is a frontend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2006-09-01'),
        endDate: new Date('2010-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'PixelCraft Studio',
        jobTitle: 'Frontend Developer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        issueDate: new Date('2011-05-15'),
        credentialId: 'META-GABRIEL-51',
        url: 'https://example.com/credentials/gabriel-anthill',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 6 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '763-194-6453',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ganthill28@reuters.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/gabrielanthill',
        username: 'gabrielanthill',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/gabriel-anthill',
        username: 'gabriel-anthill',
      },
    ],
  },
  {
    email: 'ckennerley2a@yahoo.com',
    description: {
      title: 'Backend Developer',
      bio: 'Charley is a backend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'International University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to software engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Da Nang, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior Backend Developer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Node.js Application Developer',
        issuer: 'OpenJS Foundation',
        issueDate: new Date('2011-05-15'),
        credentialId: 'OPENJS-CHARLEY-52',
        url: 'https://example.com/credentials/charley-kennerley',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Redis', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '210-980-3921',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ckennerley2a@yahoo.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/charleykennerley',
        username: 'charleykennerley',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/charley-kennerley',
        username: 'charley-kennerley',
      },
    ],
  },
  {
    email: 'bcaine2b@weebly.com',
    description: {
      title: 'Full-Stack Developer',
      bio: 'Bartel is a full-stack developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2007-09-01'),
        endDate: new Date('2011-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to information technology, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'NextWave Labs',
        jobTitle: 'Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2011-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2009-01-01'),
        endDate: new Date('2011-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Full Stack Web Development',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2012-05-15'),
        credentialId: 'FREECODECAMP-BARTEL-53',
        url: 'https://example.com/credentials/bartel-caine',
      },
    ],
    skills: [
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'TypeScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '721-512-7532',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'bcaine2b@weebly.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/bartelcaine',
        username: 'bartelcaine',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/bartel-caine',
        username: 'bartel-caine',
      },
    ],
  },
  {
    email: 'cboissier2d@angelfire.com',
    description: {
      title: 'DevOps Engineer',
      bio: 'Cly is a devops engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Polytechnic University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to computer engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Cloud Services Ltd.',
        jobTitle: 'DevOps Engineer',
        location: 'Singapore',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior DevOps Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2011-05-15'),
        credentialId: 'AMAZON-CLY-54',
        url: 'https://example.com/credentials/cly-boissier',
      },
    ],
    skills: [
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Jenkins', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'AWS', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '484-373-6957',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'cboissier2d@angelfire.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/clyboissier',
        username: 'clyboissier',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/cly-boissier',
        username: 'cly-boissier',
      },
    ],
  },
  {
    email: 'bmatevushev2f@icio.us',
    description: {
      title: 'Data Analyst',
      bio: 'Bobby is a data analyst with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Data Analytics',
        startDate: new Date('2010-09-01'),
        endDate: new Date('2014-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to data analytics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Insight Analytics',
        jobTitle: 'Data Analyst',
        location: 'Ha Noi, Vietnam',
        startDate: new Date('2014-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior Data Analyst',
        location: 'Remote',
        startDate: new Date('2012-01-01'),
        endDate: new Date('2014-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2015-05-15'),
        credentialId: 'GOOGLE-BOBBY-55',
        url: 'https://example.com/credentials/bobby-matevushev',
      },
    ],
    skills: [
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Tableau', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'Excel', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Power BI', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '560-773-6290',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'bmatevushev2f@icio.us',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/bobbymatevushev',
        username: 'bobbymatevushev',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/bobby-matevushev',
        username: 'bobby-matevushev',
      },
    ],
  },
  {
    email: 'dgarrity2g@surveymonkey.com',
    description: {
      title: 'Data Scientist',
      bio: 'Davis is a data scientist with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Statistics',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to statistics, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Analytics Corp',
        jobTitle: 'Data Scientist',
        location: 'New York, NY',
        startDate: new Date('2022-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Innovation Labs',
        jobTitle: 'Junior Data Scientist',
        location: 'Remote',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        issueDate: new Date('2023-05-15'),
        credentialId: 'GOOGLE-DAVIS-56',
        url: 'https://example.com/credentials/davis-garrity',
      },
    ],
    skills: [
      { name: 'Python', level: CandidateSkillLevel.MASTER, years: 6 },
      { name: 'R', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'TensorFlow', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      {
        name: 'Machine Learning',
        level: CandidateSkillLevel.ADVANCED,
        years: 4,
      },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '987-636-1877',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'dgarrity2g@surveymonkey.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/davisgarrity',
        username: 'davisgarrity',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/davis-garrity',
        username: 'davis-garrity',
      },
    ],
  },
  {
    email: 'mvalsler2h@typepad.com',
    description: {
      title: 'UI/UX Designer',
      bio: 'Mikaela is a ui/ux designer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'University of Science',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Digital Design',
        startDate: new Date('2009-09-01'),
        endDate: new Date('2013-06-30'),
        grade: '3.2/4.0',
        description:
          'Completed coursework and projects related to digital design, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Design Studios',
        jobTitle: 'UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2013-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Junior UI/UX Designer',
        location: 'Remote',
        startDate: new Date('2011-01-01'),
        endDate: new Date('2013-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2014-05-15'),
        credentialId: 'GOOGLE-MIKAELA-57',
        url: 'https://example.com/credentials/mikaela-valsler',
      },
    ],
    skills: [
      { name: 'Figma', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Adobe XD', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'Sketch', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      {
        name: 'User Research',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 4,
      },
      { name: 'Prototyping', level: CandidateSkillLevel.ADVANCED, years: 5 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '599-732-1838',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'mvalsler2h@typepad.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/mikaelavalsler',
        username: 'mikaelavalsler',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/mikaela-valsler',
        username: 'mikaela-valsler',
      },
    ],
  },
  {
    email: 'smcjury2i@google.de',
    description: {
      title: 'QA Engineer',
      bio: 'Stuart is a qa engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Institute of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Systems',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.3/4.0',
        description:
          'Completed coursework and projects related to information systems, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'QualityWorks',
        jobTitle: 'QA Engineer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'StartUp Hub',
        jobTitle: 'Junior QA Engineer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'ISTQB Certified Tester Foundation Level',
        issuer: 'ASTQB',
        issueDate: new Date('2011-05-15'),
        credentialId: 'ASTQB-STUART-58',
        url: 'https://example.com/credentials/stuart-mcjury',
      },
    ],
    skills: [
      { name: 'Cypress', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Jest', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'JavaScript', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Selenium', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'SQL', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '339-323-5332',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'smcjury2i@google.de',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/stuartmcjury',
        username: 'stuartmcjury',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/stuart-mcjury',
        username: 'stuart-mcjury',
      },
    ],
  },
  {
    email: 'aconiff2k@goo.gl',
    description: {
      title: 'Mobile Developer',
      bio: 'Avie is a mobile developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'National University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Mobile Application Development',
        startDate: new Date('2021-09-01'),
        endDate: new Date('2025-06-30'),
        grade: '3.4/4.0',
        description:
          'Completed coursework and projects related to mobile application development, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'AppFactory',
        jobTitle: 'Mobile Developer',
        location: 'Tokyo, Japan',
        startDate: new Date('2025-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Digital Product Lab',
        jobTitle: 'Junior Mobile Developer',
        location: 'Remote',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'App Development with Swift Certification',
        issuer: 'Apple',
        issueDate: new Date('2024-05-15'),
        credentialId: 'APPLE-AVIE-59',
        url: 'https://example.com/credentials/avie-coniff',
      },
    ],
    skills: [
      { name: 'Swift', level: CandidateSkillLevel.ADVANCED, years: 4 },
      {
        name: 'React Native',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 3,
      },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Firebase', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Kotlin', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '168-470-8347',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'aconiff2k@goo.gl',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/avieconiff',
        username: 'avieconiff',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/avie-coniff',
        username: 'avie-coniff',
      },
    ],
  },
  {
    email: 'cmcspirron2l@nymag.com',
    description: {
      title: 'Cloud Backend Engineer',
      bio: 'Cosmo is a cloud backend engineer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'CloudStack',
        jobTitle: 'Cloud Backend Engineer',
        location: 'Seattle, WA',
        startDate: new Date('2022-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Fintech Global',
        jobTitle: 'Junior Cloud Backend Engineer',
        location: 'Remote',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Google Cloud Professional Cloud Developer',
        issuer: 'Google Cloud',
        issueDate: new Date('2023-05-15'),
        credentialId: 'GOOGLE-COSMO-60',
        url: 'https://example.com/credentials/cosmo-mcspirron',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'AWS', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 5 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '343-106-6091',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'cmcspirron2l@nymag.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/cosmomcspirron',
        username: 'cosmomcspirron',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/cosmo-mcspirron',
        username: 'cosmo-mcspirron',
      },
    ],
  },
  {
    email: 'rtarge2o@latimes.com',
    description: {
      title: 'Frontend Developer',
      bio: 'Roi is a frontend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'International University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-06-30'),
        grade: '3.6/4.0',
        description:
          'Completed coursework and projects related to computer science, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'PixelCraft Studio',
        jobTitle: 'Frontend Developer',
        location: 'Ho Chi Minh City, Vietnam',
        startDate: new Date('2021-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'E-commerce Platform Co.',
        jobTitle: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: new Date('2019-01-01'),
        endDate: new Date('2021-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        issueDate: new Date('2022-05-15'),
        credentialId: 'META-ROI-61',
        url: 'https://example.com/credentials/roi-targe',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '128-482-1292',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'rtarge2o@latimes.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/roitarge',
        username: 'roitarge',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/roi-targe',
        username: 'roi-targe',
      },
    ],
  },
  {
    email: 'mgull2p@tamu.edu',
    description: {
      title: 'Backend Developer',
      bio: 'Marcille is a backend developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2005-09-01'),
        endDate: new Date('2009-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed coursework and projects related to software engineering, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Da Nang, Vietnam',
        startDate: new Date('2010-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'SaaSWorks',
        jobTitle: 'Junior Backend Developer',
        location: 'Remote',
        startDate: new Date('2008-01-01'),
        endDate: new Date('2010-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Node.js Application Developer',
        issuer: 'OpenJS Foundation',
        issueDate: new Date('2011-05-15'),
        credentialId: 'OPENJS-MARCILLE-62',
        url: 'https://example.com/credentials/marcille-gull',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Redis', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '457-119-8229',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'mgull2p@tamu.edu',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/marcillegull',
        username: 'marcillegull',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/marcille-gull',
        username: 'marcille-gull',
      },
    ],
  },
  {
    email: 'tgullyes2q@dagondesign.com',
    description: {
      title: 'Full-Stack Developer',
      bio: 'Tatum is a full-stack developer with hands-on experience in modern software teams. Strong at collaboration, problem solving, and delivering maintainable products.',
    },
    education: [
      {
        school: 'Polytechnic University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2007-09-01'),
        endDate: new Date('2011-06-30'),
        grade: '3.8/4.0',
        description:
          'Completed coursework and projects related to information technology, teamwork, and applied software development.',
      },
    ],
    experiences: [
      {
        companyName: 'NextWave Labs',
        jobTitle: 'Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2011-07-01'),
        endDate: null,
        description:
          'Worked on production features, improved team workflows, and contributed to reliable delivery of customer-facing systems.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Blue Ocean Software',
        jobTitle: 'Junior Full-Stack Developer',
        location: 'Remote',
        startDate: new Date('2009-01-01'),
        endDate: new Date('2011-06-30'),
        description:
          'Supported feature development, bug fixing, documentation, and cross-functional collaboration with product and design teams.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Full Stack Web Development',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2012-05-15'),
        credentialId: 'FREECODECAMP-TATUM-63',
        url: 'https://example.com/credentials/tatum-gullyes',
      },
    ],
    skills: [
      { name: 'React', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'TypeScript', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.INTERMEDIATE, years: 4 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '929-768-3517',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'tgullyes2q@dagondesign.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/tatumgullyes',
        username: 'tatumgullyes',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/tatum-gullyes',
        username: 'tatum-gullyes',
      },
    ],
  },
];
