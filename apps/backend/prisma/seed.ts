import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing data...');

  // Delete all data in reverse order of foreign key dependencies
  await prisma.employerRole.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.jobRequirement.deleteMany({});
  await prisma.jobPosting.deleteMany({});
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

  // Create test users
  console.log('Creating users...');
  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        emailVerified: true,
        role: 'candidate',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        emailVerified: true,
        role: 'candidate',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      },
      {
        name: 'Carol White',
        email: 'carol@example.com',
        emailVerified: true,
        role: 'employer',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        emailVerified: true,
        role: 'employer',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      },
      {
        name: 'Eve Davis',
        email: 'eve@example.com',
        emailVerified: false,
        role: 'candidate',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
      },
      {
        name: 'Frank Miller',
        email: 'frank@example.com',
        emailVerified: true,
        role: 'employer',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
      },
    ],
  });
  console.log(`Created ${users.count} users`);

  // Get users for creating job postings
  const allUsers = await prisma.user.findMany();
  const employers = allUsers.filter((u) => u.role === 'employer');
  const jobSeekers = allUsers.filter((u) => u.role === 'candidate');

  // Get categories and skills
  const allCategories = await prisma.jobCategory.findMany();
  const allSkills = await prisma.skill.findMany();

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
        companyName: 'Tech Corp',
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
        companyName: 'DataFlow Inc',
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
        companyName: 'CloudStack',
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
        companyName: 'Design Studios',
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
        companyName: 'Innovation Labs',
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
        companyName: 'StartUp Hub',
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
        companyName: 'Tech Corp',
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

  // Create sessions for some users
  console.log('Creating sessions...');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const sessions = await prisma.session.createMany({
    data: [
      {
        token: 'session_token_alice_' + Date.now(),
        expiresAt,
        userId: jobSeekers[0].id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        token: 'session_token_bob_' + Date.now(),
        expiresAt,
        userId: jobSeekers[1].id,
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      {
        token: 'session_token_carol_' + Date.now(),
        expiresAt,
        userId: employers[0].id,
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      },
    ],
  });
  console.log(`Created ${sessions.count} sessions`);

  // Create accounts
  console.log('Creating accounts...');
  const accounts = await prisma.account.createMany({
    data: [
      {
        accountId: 'google_alice',
        providerId: 'google',
        userId: jobSeekers[0].id,
        accessToken: 'google_access_token_alice',
        refreshToken: 'google_refresh_token_alice',
        scope: 'openid profile email',
      },
      {
        accountId: 'github_bob',
        providerId: 'github',
        userId: jobSeekers[1].id,
        accessToken: 'github_access_token_bob',
        refreshToken: 'github_refresh_token_bob',
        scope: 'user repo',
      },
      {
        accountId: 'email_carol',
        providerId: 'email',
        userId: employers[0].id,
        password:
          '$2a$10$fake_hashed_password_carol_should_be_real_in_production',
      },
    ],
  });
  console.log(`Created ${accounts.count} accounts`);

  // Create verifications
  console.log('Creating verifications...');
  const verificationExpiresAt = new Date();
  verificationExpiresAt.setHours(verificationExpiresAt.getHours() + 1); // 1 hour from now

  const verifications = await prisma.verification.createMany({
    data: [
      {
        identifier: 'eve@example.com',
        value: 'email_verification_code_eve_' + Math.random().toString(36),
        expiresAt: verificationExpiresAt,
      },
      {
        identifier: 'frank@example.com',
        value: 'password_reset_code_frank_' + Math.random().toString(36),
        expiresAt: verificationExpiresAt,
      },
    ],
  });
  console.log(`Created ${verifications.count} verifications`);

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
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
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
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=Nomad',
    },
  });
  console.log('Created company Nomad');

  // Assign Maria Kelly as HR in Nomad
  console.log('Creating employer role...');
  await prisma.employerRole.create({
    data: {
      companyId: nomad.id,
      employerId: maria.id,
      role: 'HR',
      assignedAt: new Date('2021-01-01'),
    },
  });
  console.log('Assigned Maria Kelly as HR in Nomad');

  console.log('Database seeding completed successfully!');
  console.log(`
Summary:
- Job Categories: ${categories.count}
- Skills: ${skills.count}
- Users: ${users.count}
- Job Postings: ${jobPostings.length}
- Job Requirements: ${jobRequirements.count}
- Sessions: ${sessions.count}
- Accounts: ${accounts.count}
- Verifications: ${verifications.count}
- Companies: 1 (Nomad)
- Employer Roles: 1 (Maria Kelly -> HR @ Nomad)
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
