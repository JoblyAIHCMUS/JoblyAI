import {
  CandidateContactType,
  CandidateExperienceType,
  CandidateSkillLevel,
  CandidateSocialPlatform,
  Degree,
} from '@prisma/client';

export const candidateProfiles = [
  {
    email: 'alice@example.com',
    description: {
      title: 'Senior Frontend Developer',
      bio: 'Experienced Frontend Developer with a passion for creating beautiful and intuitive user interfaces. Proficient in React, TypeScript, and modern web technologies.',
    },
    education: [
      {
        school: 'University of Technology',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2012-09-01'),
        endDate: new Date('2016-06-30'),
        grade: '3.8/4.0',
        description:
          'Graduated with honors and focused on web engineering and distributed systems.',
      },
    ],
    experiences: [
      {
        companyName: 'Tech Solutions Inc.',
        jobTitle: 'Senior Frontend Developer',
        location: 'San Francisco, CA',
        startDate: new Date('2018-07-01'),
        endDate: null,
        description:
          'Led the development of a new e-commerce platform using React and TypeScript. Mentored junior developers and improved code quality across the team.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Web Innovators',
        jobTitle: 'Frontend Developer',
        location: 'Boston, MA',
        startDate: new Date('2016-08-01'),
        endDate: new Date('2018-06-30'),
        description:
          'Developed and maintained client websites using JavaScript, HTML, and CSS.',
        type: CandidateExperienceType.FULL_TIME,
      },
    ],
    certificates: [
      {
        name: 'Certified Kubernetes Application Developer (CKAD)',
        issuer: 'The Linux Foundation',
        issueDate: new Date('2021-05-20'),
        credentialId: 'CKAD-ALICE-2021',
        url: 'https://example.com/ckad',
      },
    ],
    skills: [
      { name: 'TypeScript', level: CandidateSkillLevel.MASTER, years: 5 },
      { name: 'React', level: CandidateSkillLevel.MASTER, years: 5 },
      { name: 'Node.js', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'GraphQL', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '123-456-7890',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'alice.personal@email.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/alice',
        username: 'alice',
      },
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/alice',
        username: 'alice',
      },
    ],
  },
  {
    email: 'bob@example.com',
    description: {
      title: 'Backend Developer',
      bio: 'Backend developer specializing in Node.js, PostgreSQL, and building scalable APIs.',
    },
    education: [
      {
        school: 'State University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2017-06-30'),
        grade: '3.7/4.0',
        description:
          'Completed graduate coursework in backend systems, databases, and software architecture.',
      },
    ],
    experiences: [
      {
        companyName: 'Data Systems Co.',
        jobTitle: 'Backend Developer',
        location: 'Austin, TX',
        startDate: new Date('2017-08-01'),
        endDate: null,
        description:
          'Designing and implementing RESTful APIs for a variety of client applications. Working with PostgreSQL and Redis.',
        type: CandidateExperienceType.FULL_TIME,
      },
    ],
    certificates: [
      {
        name: 'PostgreSQL Associate Certification',
        issuer: 'EDB',
        issueDate: new Date('2020-10-10'),
        credentialId: 'PG-BOB-2020',
        url: 'https://example.com/postgresql-associate',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.MASTER, years: 4 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Docker', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
      { name: 'JavaScript', level: CandidateSkillLevel.MASTER, years: 6 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '098-765-4321',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'bob.backend@email.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/bob',
        username: 'bob',
      },
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/bob-backend',
        username: 'bob-backend',
      },
    ],
  },
  {
    email: 'charlie@example.com',
    description: {
      title: 'Junior Full-Stack Developer',
      bio: 'Enthusiastic junior developer eager to learn and contribute to exciting projects. Familiar with React and Express.',
    },
    education: [
      {
        school: 'Community College',
        degree: Degree.ASSOCIATE,
        fieldOfStudy: 'Web Development',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2022-06-30'),
        grade: '3.6/4.0',
        description:
          'Built several web application projects using JavaScript, React, and Express.',
      },
    ],
    experiences: [
      {
        companyName: 'Local Web Shop',
        jobTitle: 'Intern',
        location: 'Remote',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-05-31'),
        description:
          'Assisted senior developers with front-end and back-end tasks.',
        type: CandidateExperienceType.INTERNSHIP,
      },
    ],
    certificates: [
      {
        name: 'Responsive Web Design',
        issuer: 'freeCodeCamp',
        issueDate: new Date('2022-07-15'),
        credentialId: 'FCC-CHARLIE-RWD',
        url: 'https://example.com/responsive-web-design',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'React', level: CandidateSkillLevel.BEGINNER, years: 1 },
      { name: 'HTML', level: CandidateSkillLevel.ADVANCED, years: 2 },
      { name: 'CSS', level: CandidateSkillLevel.ADVANCED, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.EMAIL,
        value: 'charlie.dev@email.com',
        isPrimary: true,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/charlie-dev',
        username: 'charlie-dev',
      },
    ],
  },
  {
    email: 'sdeadman1@java.com',
    description: {
      title: 'DevOps Engineer',
      bio: 'DevOps enthusiast with experience in CI/CD pipelines, cloud infrastructure, and automation.',
    },
    education: [
      {
        school: 'University of Engineering',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-30'),
        grade: '3.5/4.0',
        description:
          'Focused on cloud computing, Linux administration, and software deployment.',
      },
    ],
    experiences: [
      {
        companyName: 'Cloud Services Ltd.',
        jobTitle: 'Junior DevOps Engineer',
        location: 'Seattle, WA',
        startDate: new Date('2022-08-01'),
        endDate: null,
        description:
          'Managed and automated deployment pipelines using Jenkins and Docker.',
        type: CandidateExperienceType.FULL_TIME,
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2023-03-15'),
        expiryDate: new Date('2026-03-15'),
        credentialId: 'AWS-SAA-SHERMAN',
        url: 'https://example.com/aws-saa',
      },
    ],
    skills: [
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 2 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'Jenkins', level: CandidateSkillLevel.ADVANCED, years: 2 },
      { name: 'Python', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '570-149-8721',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'sherman.deadman@email.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/sherman',
        username: 'sherman',
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
      title: 'Data Scientist',
      bio: 'Data Scientist with a knack for finding insights in complex datasets. Skilled in Python, R, and machine learning.',
    },
    education: [
      {
        school: 'Institute of Science',
        degree: Degree.PHD,
        fieldOfStudy: 'Statistics',
        startDate: new Date('2012-09-01'),
        endDate: new Date('2018-06-30'),
        grade: 'Distinction',
        description:
          'Research focused on statistical modeling, machine learning, and applied data analysis.',
      },
    ],
    experiences: [
      {
        companyName: 'Analytics Corp',
        jobTitle: 'Data Scientist',
        location: 'New York, NY',
        startDate: new Date('2018-08-01'),
        endDate: null,
        description:
          'Building predictive models and performing data analysis to drive business decisions.',
        type: CandidateExperienceType.FULL_TIME,
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        issueDate: new Date('2021-09-12'),
        credentialId: 'TF-KRISTI-2021',
        url: 'https://example.com/tensorflow-certificate',
      },
    ],
    skills: [
      { name: 'Python', level: CandidateSkillLevel.MASTER, years: 8 },
      { name: 'R', level: CandidateSkillLevel.MASTER, years: 8 },
      { name: 'SQL', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'TensorFlow', level: CandidateSkillLevel.ADVANCED, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.EMAIL,
        value: 'kristi.t@work.com',
        isPrimary: true,
      },
      {
        type: CandidateContactType.PHONE,
        value: '876-282-6255',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/kthundercliffe',
        username: 'kthundercliffe',
      },
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/kthundercliffe',
        username: 'kthundercliffe',
      },
    ],
  },
  {
    email: 'iquidenham7@stanford.edu',
    description: {
      title: 'Cloud Backend Engineer',
      bio: 'Backend engineer experienced in cloud-native services, API design, and distributed systems.',
    },
    education: [
      {
        school: 'Stanford University',
        degree: Degree.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2004-09-01'),
        endDate: new Date('2006-06-30'),
        grade: '3.8/4.0',
        description:
          'Studied distributed systems, database internals, and scalable backend architecture.',
      },
    ],
    experiences: [
      {
        companyName: 'Nimbus Platform',
        jobTitle: 'Cloud Backend Engineer',
        location: 'Palo Alto, CA',
        startDate: new Date('2019-04-01'),
        endDate: null,
        description:
          'Designed microservices, improved API latency, and maintained event-driven workflows for enterprise customers.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Core API Labs',
        jobTitle: 'Software Engineer',
        location: 'San Jose, CA',
        startDate: new Date('2015-02-01'),
        endDate: new Date('2019-03-31'),
        description:
          'Built internal APIs, database migrations, and background job processing services.',
        type: CandidateExperienceType.FULL_TIME,
      },
    ],
    certificates: [
      {
        name: 'Google Cloud Professional Cloud Developer',
        issuer: 'Google Cloud',
        issueDate: new Date('2022-02-18'),
        expiryDate: new Date('2025-02-18'),
        credentialId: 'GCP-ILARIO-2022',
        url: 'https://example.com/gcp-cloud-developer',
      },
    ],
    skills: [
      { name: 'Node.js', level: CandidateSkillLevel.ADVANCED, years: 5 },
      { name: 'PostgreSQL', level: CandidateSkillLevel.ADVANCED, years: 6 },
      { name: 'Docker', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'Kubernetes', level: CandidateSkillLevel.INTERMEDIATE, years: 3 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '309-807-8302',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'ilario.quidenham@email.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/ilario-quidenham',
        username: 'ilario-quidenham',
      },
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/iquidenham',
        username: 'iquidenham',
      },
    ],
  },
  {
    email: 'tcatanheira9@usgs.gov',
    description: {
      title: 'UX/UI Designer',
      bio: 'Creative UX/UI designer focused on delivering user-centric and visually appealing digital products.',
    },
    education: [
      {
        school: 'Design School',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Graphic Design',
        startDate: new Date('2019-09-01'),
        endDate: new Date('2023-06-30'),
        grade: '3.7/4.0',
        description:
          'Specialized in interface design, user research, and visual communication.',
      },
    ],
    experiences: [
      {
        companyName: 'Creative Agency',
        jobTitle: 'UX/UI Design Intern',
        location: 'Portland, OR',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-05-31'),
        description:
          'Worked on wireframes, mockups, and prototypes for various client projects.',
        type: CandidateExperienceType.INTERNSHIP,
      },
      {
        companyName: 'Pixel Studio',
        jobTitle: 'Junior Product Designer',
        location: 'Remote',
        startDate: new Date('2023-07-01'),
        endDate: null,
        description:
          'Designs user flows, validates prototypes, and collaborates with engineers to ship responsive interfaces.',
        type: CandidateExperienceType.FULL_TIME,
      },
    ],
    certificates: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        issueDate: new Date('2023-08-20'),
        credentialId: 'GOOGLE-UX-TATE',
        url: 'https://example.com/google-ux-design',
      },
    ],
    skills: [
      { name: 'Figma', level: CandidateSkillLevel.ADVANCED, years: 2 },
      { name: 'Sketch', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
      { name: 'Adobe XD', level: CandidateSkillLevel.INTERMEDIATE, years: 1 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '575-166-0888',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'tate.design@email.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.DRIBBBLE,
        url: 'https://dribbble.com/tate',
        username: 'tate',
      },
      {
        platform: CandidateSocialPlatform.BEHANCE,
        url: 'https://behance.net/tate-catanheira',
        username: 'tate-catanheira',
      },
    ],
  },
  {
    email: 'cpridiea@feedburner.com',
    description: {
      title: 'QA Automation Engineer',
      bio: 'Quality assurance engineer focused on automated testing, reliable releases, and improving engineering workflows.',
    },
    education: [
      {
        school: 'National Technical College',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Information Systems',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-06-30'),
        grade: '3.5/4.0',
        description:
          'Completed coursework in software testing, database systems, and web application development.',
      },
    ],
    experiences: [
      {
        companyName: 'QualityWorks Studio',
        jobTitle: 'QA Automation Engineer',
        location: 'Chicago, IL',
        startDate: new Date('2020-03-01'),
        endDate: null,
        description:
          'Created automated test suites for web applications, maintained regression pipelines, and reported release risks.',
        type: CandidateExperienceType.FULL_TIME,
      },
      {
        companyName: 'Bright Apps',
        jobTitle: 'Manual QA Tester',
        location: 'Remote',
        startDate: new Date('2019-07-01'),
        endDate: new Date('2020-02-29'),
        description:
          'Executed manual test plans and collaborated with developers to reproduce and verify bug fixes.',
        type: CandidateExperienceType.CONTRACT,
      },
    ],
    certificates: [
      {
        name: 'ISTQB Certified Tester Foundation Level',
        issuer: 'ISTQB',
        issueDate: new Date('2021-06-25'),
        credentialId: 'ISTQB-CONCETTINA',
        url: 'https://example.com/istqb-foundation',
      },
    ],
    skills: [
      { name: 'JavaScript', level: CandidateSkillLevel.ADVANCED, years: 4 },
      { name: 'TypeScript', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
      { name: 'Cypress', level: CandidateSkillLevel.ADVANCED, years: 3 },
      { name: 'Jest', level: CandidateSkillLevel.INTERMEDIATE, years: 2 },
    ],
    contacts: [
      {
        type: CandidateContactType.PHONE,
        value: '756-995-6313',
        isPrimary: true,
      },
      {
        type: CandidateContactType.EMAIL,
        value: 'concettina.qa@email.com',
        isPrimary: false,
      },
    ],
    socials: [
      {
        platform: CandidateSocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/concettina-pridie',
        username: 'concettina-pridie',
      },
      {
        platform: CandidateSocialPlatform.GITHUB,
        url: 'https://github.com/cpridie',
        username: 'cpridie',
      },
    ],
  },
  {
    email: 'ygrimmd@blogger.com',
    description: {
      title: 'Mobile Developer (iOS)',
      bio: 'iOS Developer with a strong background in Swift and building native applications.',
    },
    education: [
      {
        school: 'Technical University',
        degree: Degree.BACHELOR,
        fieldOfStudy: 'Mobile Application Development',
        startDate: new Date('2014-09-01'),
        endDate: new Date('2018-06-30'),
        grade: '3.6/4.0',
        description:
          'Built several native mobile projects and studied mobile UX patterns.',
      },
    ],
    experiences: [
      {
        companyName: 'AppFactory',
        jobTitle: 'iOS Developer',
        location: 'Los Angeles, CA',
        startDate: new Date('2018-07-01'),
        endDate: null,
        description:
          'Developing and maintaining high-quality iOS applications for a global user base.',
        type: CandidateExperienceType.FULL_TIME,
      },
    ],
    certificates: [
      {
        name: 'App Development with Swift Certification',
        issuer: 'Apple',
        issueDate: new Date('2020-11-10'),
        credentialId: 'APPLE-YUMA-SWIFT',
        url: 'https://example.com/apple-swift-certification',
      },
    ],
    skills: [
      { name: 'Swift', level: CandidateSkillLevel.MASTER, years: 4 },
      {
        name: 'Objective-C',
        level: CandidateSkillLevel.INTERMEDIATE,
        years: 2,
      },
      { name: 'Xcode', level: CandidateSkillLevel.MASTER, years: 4 },
    ],
    contacts: [
      {
        type: CandidateContactType.EMAIL,
        value: 'yuma.grimm@dev.com',
        isPrimary: true,
      },
      {
        type: CandidateContactType.PHONE,
        value: '161-139-5580',
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
];
