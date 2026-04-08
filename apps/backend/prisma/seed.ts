import { PrismaClient, Gender } from '@prisma/client';
import { randomBytes } from 'crypto';
import { scryptAsync } from '@noble/hashes/scrypt.js';

const prisma = new PrismaClient();

// Better-auth password hashing config
const SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
};

// Hash password using scrypt (compatible with Better-auth)
async function hashPassword(password: string): Promise<string> {
  const salt = Buffer.from(randomBytes(16)).toString('hex');
  const key = await scryptAsync(password.normalize('NFKC'), salt, {
    N: SCRYPT_CONFIG.N,
    p: SCRYPT_CONFIG.p,
    r: SCRYPT_CONFIG.r,
    dkLen: SCRYPT_CONFIG.dkLen,
    maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
  });
  return `${salt}:${Buffer.from(key).toString('hex')}`;
}

async function main() {
  console.log('Cleaning up existing data...');

  // Delete all data in reverse order of foreign key dependencies
  await prisma.application.deleteMany({});
  await prisma.jobRequirement.deleteMany({});
  await prisma.jobPosting.deleteMany({});
  await prisma.employer.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.resume.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.jobCategory.deleteMany({});
  await prisma.skill.deleteMany({});

  console.log('Data cleaned up successfully');

  console.log('Seeding database with test data...');

  // Create job categories
  console.log('Creating job categories...');
  const categories = await prisma.jobCategory.createMany({
    data: [
      { name: 'Software Development', slug: 'software-development' },
      { name: 'Data Science', slug: 'data-science' },
      { name: 'DevOps', slug: 'devops' },
      { name: 'Design', slug: 'design' },
      { name: 'Product Management', slug: 'product-management' },
      { name: 'Sales', slug: 'sales' },
      { name: 'Marketing', slug: 'marketing' },
      { name: 'Customer Support', slug: 'customer-support' },
    ],
  });
  console.log(`Created ${categories.count} job categories`);

  // Create skills
  console.log('Creating skills...');
  const skills = await prisma.skill.createMany({
    data: [
      { name: 'JavaScript' },
      { name: 'TypeScript' },
      { name: 'React' },
      { name: 'Node.js' },
      { name: 'PostgreSQL' },
      { name: 'Docker' },
      { name: 'Kubernetes' },
      { name: 'AWS' },
      { name: 'Python' },
      { name: 'Machine Learning' },
      { name: 'TensorFlow' },
      { name: 'Figma' },
      { name: 'UI/UX Design' },
      { name: 'Project Management' },
      { name: 'Git' },
      { name: 'REST APIs' },
      { name: 'GraphQL' },
      { name: 'Agile' },
    ],
  });
  console.log(`Created ${skills.count} skills`);

  // Create test users with accounts (for Better-auth email/password login)
  console.log('Creating users and accounts...');
  const hashedPassword = await hashPassword('TestPass123!');

  const usersData: Array<{
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    role: string;
    avatarUrl: string;
    phoneNumber: string;
    dateOfBirth: Date;
    gender: Gender;
  }> = [
    {
      name: 'Alice Johnson',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      emailVerified: true,
      role: 'candidate',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      phoneNumber: '+1-555-0101',
      dateOfBirth: new Date('1990-05-15'),
      gender: Gender.FEMALE,
    },
    {
      name: 'Bob Smith',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      emailVerified: true,
      role: 'candidate',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      phoneNumber: '+1-555-0102',
      dateOfBirth: new Date('1988-08-22'),
      gender: Gender.MALE,
    },
    {
      name: 'Carol White',
      firstName: 'Carol',
      lastName: 'White',
      email: 'carol@example.com',
      emailVerified: true,
      role: 'employer',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
      phoneNumber: '+1-555-0103',
      dateOfBirth: new Date('1985-03-10'),
      gender: Gender.FEMALE,
    },
    {
      name: 'David Brown',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@example.com',
      emailVerified: true,
      role: 'employer',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      phoneNumber: '+1-555-0104',
      dateOfBirth: new Date('1987-11-30'),
      gender: Gender.MALE,
    },
    {
      name: 'Eve Davis',
      firstName: 'Eve',
      lastName: 'Davis',
      email: 'eve@example.com',
      emailVerified: false,
      role: 'candidate',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
      phoneNumber: '+1-555-0105',
      dateOfBirth: new Date('1992-07-18'),
      gender: Gender.FEMALE,
    },
    {
      name: 'Frank Miller',
      firstName: 'Frank',
      lastName: 'Miller',
      email: 'frank@example.com',
      emailVerified: true,
      role: 'employer',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
      phoneNumber: '+1-555-0106',
      dateOfBirth: new Date('1986-01-25'),
      gender: Gender.MALE,
    },
  ];

  // Create each user with their account
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: userData,
    });

    // Create account for Better-auth email/password authentication
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.email, // Better-auth uses email as accountId for credential provider
        providerId: 'credential', // Better-auth provider for email/password
        password: hashedPassword,
      },
    });
  }

  console.log(`Created ${usersData.length} users with accounts`);

  // Get users for creating job postings
  const allUsers = await prisma.user.findMany();
  const employers = allUsers.filter((u) => u.role === 'employer');
  const jobSeekers = allUsers.filter((u) => u.role === 'candidate');

  // Get categories and skills
  const allCategories = await prisma.jobCategory.findMany();
  const allSkills = await prisma.skill.findMany();

  // Create companies
  console.log('Creating companies...');
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Tech Corp',
        websiteUrl: 'https://techcorp.com',
        sizeRange: '1000-5000',
        industry: 'Software Development',
        description: 'Leading technology innovation company',
        logoUrl: '',
      },
    }),
    prisma.company.create({
      data: {
        name: 'DataFlow Inc',
        websiteUrl: 'https://dataflow.com',
        sizeRange: '500-1000',
        industry: 'Data Science',
        description: 'Data science and analytics solutions',
        logoUrl: '',
      },
    }),
    prisma.company.create({
      data: {
        name: 'CloudStack',
        websiteUrl: 'https://cloudstack.io',
        sizeRange: '200-500',
        industry: 'Cloud Infrastructure',
        description: 'Cloud infrastructure and DevOps services',
        logoUrl: '',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Design Studios',
        websiteUrl: 'https://designstudios.com',
        sizeRange: '50-200',
        industry: 'Design',
        description: 'Creative design and UX solutions',
        logoUrl: '',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Innovation Labs',
        websiteUrl: 'https://innovationlabs.com',
        sizeRange: '100-500',
        industry: 'Product Development',
        description: 'Product innovation and development',
        logoUrl: '',
      },
    }),
    prisma.company.create({
      data: {
        name: 'StartUp Hub',
        websiteUrl: 'https://startuphub.com',
        sizeRange: '20-100',
        industry: 'Startup Incubation',
        description: 'Startup incubation and mentorship',
        logoUrl: '',
      },
    }),
  ]);
  console.log(`Created ${companies.length} companies`);

  // Create job postings
  console.log('Creating job postings...');
  const jobPostings = await Promise.all([
    prisma.jobPosting.create({
      data: {
        title: 'Senior Full Stack Engineer',
        description:
          'We are looking for an experienced full stack engineer to join our team. You will work on both frontend and backend systems.',
        location: 'San Francisco, CA',
        salaryMin: 120000,
        salaryMax: 180000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'FULL_TIME',
        postedById: employers[0].id,
        categoryId: allCategories[0].id,
        companyId: companies[0].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Data Scientist',
        description:
          'Join our data science team to build machine learning models that impact millions of users.',
        location: 'New York, NY',
        salaryMin: 110000,
        salaryMax: 160000,
        currency: 'USD',
        status: 'OPEN',
        remote: false,
        type: 'FULL_TIME',
        postedById: employers[1].id,
        categoryId: allCategories[1].id,
        companyId: companies[1].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'DevOps Engineer',
        description:
          'Help us scale our infrastructure and improve our deployment pipeline.',
        location: 'Remote',
        salaryMin: 100000,
        salaryMax: 150000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'FULL_TIME',
        postedById: employers[2].id,
        categoryId: allCategories[2].id,
        companyId: companies[2].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'UI/UX Designer',
        description:
          'Design beautiful and intuitive user interfaces for our web and mobile applications.',
        location: 'Los Angeles, CA',
        salaryMin: 80000,
        salaryMax: 120000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'FULL_TIME',
        postedById: employers[0].id,
        categoryId: allCategories[3].id,
        companyId: companies[3].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Product Manager',
        description:
          'Lead product strategy and roadmap for our flagship product.',
        location: 'Boston, MA',
        salaryMin: 130000,
        salaryMax: 170000,
        currency: 'USD',
        status: 'OPEN',
        remote: false,
        type: 'FULL_TIME',
        postedById: employers[1].id,
        categoryId: allCategories[4].id,
        companyId: companies[4].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Junior React Developer',
        description:
          'Great opportunity for early-career developers to grow with our team.',
        location: 'Remote',
        salaryMin: 60000,
        salaryMax: 85000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'FULL_TIME',
        postedById: employers[2].id,
        categoryId: allCategories[0].id,
        companyId: companies[5].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Backend Engineer (Python)',
        description: 'Build and maintain our Python-based backend services.',
        location: 'Seattle, WA',
        salaryMin: 105000,
        salaryMax: 155000,
        currency: 'USD',
        status: 'DRAFT',
        remote: true,
        type: 'FULL_TIME',
        postedById: employers[0].id,
        categoryId: allCategories[0].id,
        companyId: companies[0].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Part-Time Content Writer',
        description: 'Write technical blog posts and documentation.',
        location: 'Remote',
        salaryMin: 25000,
        salaryMax: 45000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'PART_TIME',
        postedById: employers[1].id,
        categoryId: allCategories[5].id,
        companyId: companies[4].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Part-Time Graphic Designer',
        description: 'Design marketing materials and social media content.',
        location: 'Remote',
        salaryMin: 30000,
        salaryMax: 50000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'PART_TIME',
        postedById: employers[2].id,
        categoryId: allCategories[3].id,
        companyId: companies[3].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Internship - Frontend Development',
        description: 'Learn front-end development with our experienced team.',
        location: 'New York, NY',
        salaryMin: 15000,
        salaryMax: 25000,
        currency: 'USD',
        status: 'OPEN',
        remote: false,
        type: 'INTERNSHIP',
        postedById: employers[0].id,
        categoryId: allCategories[0].id,
        companyId: companies[0].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Contract - Mobile App Developer',
        description: 'Develop a mobile app for 3-6 months contract.',
        location: 'Remote',
        salaryMin: 70000,
        salaryMax: 100000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'CONTRACT',
        postedById: employers[1].id,
        categoryId: allCategories[0].id,
        companyId: companies[1].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Freelance - WordPress Developer',
        description: 'Build and maintain WordPress websites.',
        location: 'Remote',
        salaryMin: 40000,
        salaryMax: 70000,
        currency: 'USD',
        status: 'OPEN',
        remote: true,
        type: 'FREELANCE',
        postedById: employers[2].id,
        categoryId: allCategories[0].id,
        companyId: companies[5].id,
      },
    }),
  ]);
  console.log(`Created ${jobPostings.length} job postings`);

  // Create job requirements
  console.log('Creating job requirements...');

  // Create a Map for faster skill lookups
  const skillMap = new Map(allSkills.map((s) => [s.name, s.id]));
  const getSkillId = (name: string): number => {
    const id = skillMap.get(name);
    if (id === undefined) {
      throw new Error(`Skill "${name}" not found`);
    }
    return id;
  };

  const jobRequirementsData = [
    // Senior Full Stack Engineer requirements
    {
      jobPostingId: jobPostings[0].id,
      skillId: getSkillId('TypeScript'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 5,
    },
    {
      jobPostingId: jobPostings[0].id,
      skillId: getSkillId('React'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 4,
    },
    {
      jobPostingId: jobPostings[0].id,
      skillId: getSkillId('Node.js'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 4,
    },
    {
      jobPostingId: jobPostings[0].id,
      skillId: getSkillId('PostgreSQL'),
      importance: 'PREFERRED' as const,
      minYearsExperience: 3,
    },
    {
      jobPostingId: jobPostings[0].id,
      skillId: getSkillId('Docker'),
      importance: 'PREFERRED' as const,
      minYearsExperience: 2,
    },
    // Data Scientist requirements
    {
      jobPostingId: jobPostings[1].id,
      skillId: getSkillId('Python'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 3,
    },
    {
      jobPostingId: jobPostings[1].id,
      skillId: getSkillId('Machine Learning'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 2,
    },
    {
      jobPostingId: jobPostings[1].id,
      skillId: getSkillId('TensorFlow'),
      importance: 'PREFERRED' as const,
      minYearsExperience: 1,
    },
    // DevOps Engineer requirements
    {
      jobPostingId: jobPostings[2].id,
      skillId: getSkillId('Docker'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 3,
    },
    {
      jobPostingId: jobPostings[2].id,
      skillId: getSkillId('Kubernetes'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 2,
    },
    {
      jobPostingId: jobPostings[2].id,
      skillId: getSkillId('AWS'),
      importance: 'PREFERRED' as const,
      minYearsExperience: 2,
    },
    // UI/UX Designer requirements
    {
      jobPostingId: jobPostings[3].id,
      skillId: getSkillId('Figma'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 2,
    },
    {
      jobPostingId: jobPostings[3].id,
      skillId: getSkillId('UI/UX Design'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 3,
    },
    // Product Manager requirements
    {
      jobPostingId: jobPostings[4].id,
      skillId: getSkillId('Project Management'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 4,
    },
    {
      jobPostingId: jobPostings[4].id,
      skillId: getSkillId('Agile'),
      importance: 'PREFERRED' as const,
      minYearsExperience: 2,
    },
    // Junior React Developer requirements
    {
      jobPostingId: jobPostings[5].id,
      skillId: getSkillId('React'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 0,
    },
    {
      jobPostingId: jobPostings[5].id,
      skillId: getSkillId('JavaScript'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 1,
    },
    {
      jobPostingId: jobPostings[5].id,
      skillId: getSkillId('Git'),
      importance: 'PREFERRED' as const,
      minYearsExperience: 1,
    },
    // Backend Engineer (Python) requirements
    {
      jobPostingId: jobPostings[6].id,
      skillId: getSkillId('Python'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 3,
    },
    {
      jobPostingId: jobPostings[6].id,
      skillId: getSkillId('REST APIs'),
      importance: 'REQUIRED' as const,
      minYearsExperience: 2,
    },
    {
      jobPostingId: jobPostings[6].id,
      skillId: getSkillId('PostgreSQL'),
      importance: 'PREFERRED' as const,
      minYearsExperience: 2,
    },
  ];

  const jobRequirements = await prisma.jobRequirement.createMany({
    data: jobRequirementsData,
  });
  console.log(`Created ${jobRequirements.count} job requirements`);

  // Create verifications
  console.log('Creating verifications...');
  const verificationExpiresAt = new Date();
  verificationExpiresAt.setHours(verificationExpiresAt.getHours() + 1); // 1 hour from now

  const verifications = await prisma.verification.createMany({
    data: [
      {
        identifier: 'eve@example.com',
        value: 'email_verification_code_eve_' + randomBytes(16).toString('hex'),
        expiresAt: verificationExpiresAt,
      },
      {
        identifier: 'frank@example.com',
        value: 'password_reset_code_frank_' + randomBytes(16).toString('hex'),
        expiresAt: verificationExpiresAt,
      },
    ],
  });
  console.log(`Created ${verifications.count} verifications`);

  // Create resumes for candidates
  console.log('Creating resumes...');
  const resumes = await Promise.all([
    // Alice's resumes
    prisma.resume.create({
      data: {
        candidateId: jobSeekers[0].id, // Alice
        fileKey: 'resumes/alice-senior-dev.pdf',
        fileName: 'alice-senior-dev.pdf',
        fileType: 'application/pdf',
        fileSize: 245678,
        parsedText:
          'Alice Johnson - Senior Full Stack Developer\n\nExperience:\n- 5+ years TypeScript, React, Node.js\n- Led team of 5 developers\n- Built scalable microservices\n\nSkills: TypeScript, React, Node.js, PostgreSQL, Docker',
        aiScore: 0.92,
        isDefault: true,
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: jobSeekers[0].id, // Alice - alternative resume
        fileKey: 'resumes/alice-fullstack.pdf',
        fileName: 'alice-fullstack.pdf',
        fileType: 'application/pdf',
        fileSize: 198234,
        parsedText:
          'Alice Johnson - Full Stack Engineer\n\nFocused on modern web technologies and cloud infrastructure.',
        aiScore: 0.88,
        isDefault: false,
      },
    }),
    // Bob's resume
    prisma.resume.create({
      data: {
        candidateId: jobSeekers[1].id, // Bob
        fileKey: 'resumes/bob-react-dev.pdf',
        fileName: 'bob-react-dev.pdf',
        fileType: 'application/pdf',
        fileSize: 186543,
        parsedText:
          'Bob Smith - React Developer\n\nExperience:\n- 2 years React development\n- Built responsive SPAs\n- Strong JavaScript fundamentals\n\nSkills: React, JavaScript, HTML, CSS, Git',
        aiScore: 0.75,
        isDefault: true,
      },
    }),
    // Eve's resume
    prisma.resume.create({
      data: {
        candidateId: jobSeekers[2].id, // Eve
        fileKey: 'resumes/eve-junior-dev.pdf',
        fileName: 'eve-junior-dev.pdf',
        fileType: 'application/pdf',
        fileSize: 123456,
        parsedText:
          'Eve Davis - Junior Developer\n\nRecent graduate with passion for web development.\n\nSkills: JavaScript, React basics, Git',
        aiScore: 0.68,
        isDefault: true,
      },
    }),
  ]);
  console.log(`Created ${resumes.length} resumes`);

  // Create applications
  console.log('Creating applications...');
  const applications = await Promise.all([
    // Alice applies to Senior Full Stack Engineer
    prisma.application.create({
      data: {
        jobId: jobPostings[0].id, // Senior Full Stack Engineer
        candidateId: jobSeekers[0].id, // Alice
        resumeId: resumes[0].id, // Alice's default resume
        status: 'APPLIED',
        matchPercentage: 0.92,
        aiFeedback: {
          summary:
            'Excellent match! Strong background in required technologies.',
          strengths: [
            'TypeScript expertise',
            'React experience',
            'Leadership skills',
          ],
          gaps: [],
        },
      },
    }),
    // Alice applies to DevOps Engineer
    prisma.application.create({
      data: {
        jobId: jobPostings[2].id, // DevOps Engineer
        candidateId: jobSeekers[0].id, // Alice
        resumeId: resumes[1].id, // Alice's alternative resume
        status: 'INTERVIEW',
        matchPercentage: 0.78,
        aiFeedback: {
          summary: 'Good match with some DevOps experience.',
          strengths: ['Docker knowledge', 'Cloud infrastructure'],
          gaps: ['Limited Kubernetes experience'],
        },
      },
    }),
    // Bob applies to Junior React Developer
    prisma.application.create({
      data: {
        jobId: jobPostings[5].id, // Junior React Developer
        candidateId: jobSeekers[1].id, // Bob
        resumeId: resumes[2].id, // Bob's resume
        status: 'APPLIED',
        matchPercentage: 0.85,
        aiFeedback: {
          summary: 'Great fit for junior position.',
          strengths: ['React skills', 'JavaScript fundamentals'],
          gaps: [],
        },
      },
    }),
    // Bob applies to Senior Full Stack (overqualified rejection example)
    prisma.application.create({
      data: {
        jobId: jobPostings[0].id, // Senior Full Stack Engineer
        candidateId: jobSeekers[1].id, // Bob
        resumeId: resumes[2].id,
        status: 'REJECTED',
        matchPercentage: 0.45,
        aiFeedback: {
          reason: 'Insufficient experience for senior position',
          tips: 'Consider applying for mid-level positions and gain 2-3 more years of experience in backend technologies.',
          summary: 'Good React skills but lacking senior-level experience.',
          strengths: ['React knowledge'],
          gaps: ['Backend experience', 'Team leadership', 'System design'],
        },
      },
    }),
    // Eve applies to Junior React Developer
    prisma.application.create({
      data: {
        jobId: jobPostings[5].id, // Junior React Developer
        candidateId: jobSeekers[2].id, // Eve
        resumeId: resumes[3].id,
        status: 'APPLIED',
        matchPercentage: 0.72,
        aiFeedback: {
          summary: 'Entry-level candidate with potential.',
          strengths: ['Enthusiasm', 'Basic React knowledge'],
          gaps: ['Limited professional experience'],
        },
      },
    }),
  ]);
  console.log(`Created ${applications.length} applications`);

  // Create Maria Kelly (employer)
  console.log('Creating Maria Kelly...');
  const maria = await prisma.user.create({
    data: {
      name: 'Maria Kelly',
      email: 'MariaKelly@email.com',
      emailVerified: true,
      role: 'employer',
      firstName: 'Maria',
      lastName: 'Kelly',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
  });
  console.log('Created user Maria Kelly');

  // Create Nomad company
  console.log('Creating Nomad company...');
  const nomad = await prisma.company.create({
    data: {
      name: 'Nomad',
      websiteUrl: 'https://www.nomad.com',
      sizeRange: '1-50',
      industry: 'Technology',
      description:
        'Nomad is a technology company focused on building innovative remote-first solutions for the modern workforce.',
      logoUrl: '',
    },
  });
  console.log('Created company Nomad');

  // Assign Maria Kelly as admin in Nomad
  console.log('Setting up Maria Kelly as admin...');
  const mariaEmployer = await prisma.employer.create({
    data: {
      companyId: nomad.id,
      employerId: maria.id,
      role: 'admin',
      assignedAt: new Date('2021-01-01'),
    },
  });

  // Update Nomad to set Maria as admin
  await prisma.company.update({
    where: { id: nomad.id },
    data: { adminId: mariaEmployer.id },
  });
  console.log('Assigned Maria Kelly as admin in Nomad');

  // Create Grace Lee (employer to test admin add employee flow)
  console.log('Creating Grace Lee...');
  const grace = await prisma.user.create({
    data: {
      name: 'Grace Lee',
      email: 'grace@example.com',
      emailVerified: true,
      role: 'employer',
      firstName: 'Grace',
      lastName: 'Lee',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
    },
  });

  // Create account for Grace
  await prisma.account.create({
    data: {
      userId: grace.id,
      accountId: grace.email,
      providerId: 'credential',
      password: hashedPassword,
    },
  });
  console.log('Created user Grace Lee');

  // Add Grace to Nomad as employee (added by admin Maria)
  console.log('Adding Grace to Nomad company...');
  await prisma.employer.create({
    data: {
      companyId: nomad.id,
      employerId: grace.id,
      role: 'employee',
      assignedAt: new Date(),
    },
  });
  console.log('Added Grace to Nomad as employee');

  // Assign Carol White as HR in Tech Corp
  console.log('Creating employer role for Carol...');
  const carol = allUsers.find((u) => u.email === 'carol@example.com');
  if (carol) {
    await prisma.employer.create({
      data: {
        companyId: companies[0].id, // Tech Corp
        employerId: carol.id,
        role: 'HR',
        assignedAt: new Date('2021-01-01'),
      },
    });
    console.log('Assigned Carol White as HR in Tech Corp');
  }

  console.log('Database seeding completed successfully!');
  console.log(`
Summary:
- Job Categories: ${categories.count}
- Skills: ${skills.count}
- Users: ${usersData.length} (with credential accounts)
  * Candidates: ${jobSeekers.length}
  * Employers: ${employers.length}
- Resumes: ${resumes.length}
- Job Postings: ${jobPostings.length}
- Job Requirements: ${jobRequirements.count}
- Applications: ${applications.length}
- Verifications: ${verifications.count}

📝 Test Data:
Candidates:
  - Alice (alice@example.com) - Senior developer, 2 resumes, 2 applications
  - Bob (bob@example.com) - React developer, 1 resume, 2 applications (1 rejected)
  - Eve (eve@example.com) - Junior developer, 1 resume, 1 application

Employers:
  - Carol (carol@example.com) - Posted Senior Full Stack job
  - David (david@example.com) - Posted Data Scientist job
  - Frank (frank@example.com) - Posted DevOps job
  - Maria Kelly (MariaKelly@email.com) - Admin of Nomad
  - Grace Lee (grace@example.com) - Employee at Nomad (added by admin)

Jobs (OPEN):
  1. Senior Full Stack Engineer (Tech Corp) - 2 applications
  2. Data Scientist (DataFlow Inc)
  3. DevOps Engineer (CloudStack) - 1 application
  4. UI/UX Designer (Design Studios)
  5. Product Manager (Innovation Labs)
  6. Junior React Developer (StartUp Hub) - 2 applications
- Companies: 1 (Nomad with Maria Kelly as admin, Grace Lee as employee)
- Employer Roles: 2 (Maria Kelly -> admin @ Nomad, Grace Lee -> employee @ Nomad)

🧪 Test Cases for Employer Management:
1. Maria Kelly (admin of Nomad) can add/remove employers
2. Grace Lee (already employed) cannot create new company
3. Maria Kelly can grant admin to other employers
  `);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
