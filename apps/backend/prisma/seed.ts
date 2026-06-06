import {
  PrismaClient,
  Gender,
  EmploymentType,
  JobStatus,
  RequirementImportance,
  Employer,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { jobCategories } from './data/JobCategory';
import { Skill } from './data/Skill';
import { users } from './data/User';
import { resumeMetadata } from './data/resumemetadata';
import { company } from './data/Company';
import { jobPosting } from './data/JobPosting';
import { candidateProfiles } from './data/CandidateProfile';

const prisma = new PrismaClient();

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createUniqueSlugFactory() {
  const usedSlugs = new Set<string>();

  return (name: string): string => {
    const baseSlug = toSlug(name) || 'company';
    let candidate = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(candidate)) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    usedSlugs.add(candidate);
    return candidate;
  };
}

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
  const seedMode = process.env.SEED_MODE || 'development';
  console.log(`Starting seeding in ${seedMode} mode...`);

  if (seedMode === 'development') {
    console.log('Cleaning up existing data...');
    // Delete all data in reverse order of foreign key dependencies
    await prisma.application.deleteMany({});
    await prisma.jobRequirement.deleteMany({});
    await prisma.jobPosting.deleteMany({});
    await prisma.employer.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.resume.deleteMany({});
    await prisma.candidateSocial.deleteMany({});
    await prisma.candidateContact.deleteMany({});
    await prisma.candidateSkill.deleteMany({});
    await prisma.candidateDescription.deleteMany({});
    await prisma.certificate.deleteMany({});
    await prisma.experience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.verification.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.jobCategory.deleteMany({});
    await prisma.skill.deleteMany({});
    console.log('Data cleaned up successfully');
  }

  // --- SYSTEM DATA (Always seed using upsert) ---
  console.log('Seeding system data (Job Categories & Skills)...');

  // Create job categories
  for (const category of jobCategories) {
    await prisma.jobCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Synced ${jobCategories.length} job categories`);

  // Create skills
  for (const skill of Skill) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: { name: skill.name },
    });
  }
  console.log(`Synced ${Skill.length} skills`);

  if (seedMode === 'system') {
    console.log('System data seeding completed successfully!');
    return;
  }

  // --- MOCK DATA (Only for development) ---
  console.log('Seeding database with mock test data...');
  const hashedPassword = await hashPassword('TestPass123!');

  const usersData = users.map((u) => ({
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl,
    phoneNumber: u.phoneNumber,
    dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth) : null,
    gender: u.gender as Gender,
  }));
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

  // Create candidate profiles
  console.log('Creating candidate profiles...');
  const candidateUsers = allUsers.filter((u) => u.role === 'candidate');
  const userMap = new Map(candidateUsers.map((u) => [u.email, u.id]));
  const skillMap = new Map(allSkills.map((s) => [s.name, s.id]));

  for (const profile of candidateProfiles) {
    const candidateId = userMap.get(profile.email);
    if (!candidateId) {
      console.warn(`Could not find candidate with email: ${profile.email}`);
      continue;
    }

    // Create CandidateDescription
    if (profile.description) {
      await prisma.candidateDescription.create({
        data: {
          candidateId,
          ...profile.description,
        },
      });
    }

    // Create Education
    if (profile.education && profile.education.length > 0) {
      await prisma.education.createMany({
        data: profile.education.map((edu) => ({
          candidateId,
          ...edu,
        })),
      });
    }

    // Create Experience
    if (profile.experiences && profile.experiences.length > 0) {
      await prisma.experience.createMany({
        data: profile.experiences.map((exp) => ({
          candidateId,
          ...exp,
        })),
      });
    }

    // Create Certificate
    if (profile.certificates && profile.certificates.length > 0) {
      await prisma.certificate.createMany({
        data: profile.certificates.map((cert) => ({
          candidateId,
          ...cert,
        })),
      });
    }

    // Create CandidateSkill
    if (profile.skills && profile.skills.length > 0) {
      const skillData = profile.skills
        .map((skill) => {
          const skillId = skillMap.get(skill.name);
          if (!skillId) {
            console.warn(`Skill not found: ${skill.name}`);
            return null;
          }
          return {
            candidateId,
            skillId,
            level: skill.level,
            years: skill.years,
          };
        })
        .filter((s) => s !== null);

      // Avoid duplicates
      const uniqueSkillData = Array.from(
        new Map(
          skillData.map((s) => [`${s.candidateId}-${s.skillId}`, s])
        ).values()
      );

      if (uniqueSkillData.length > 0) {
        await prisma.candidateSkill.createMany({
          data: uniqueSkillData,
          skipDuplicates: true, // Failsafe
        });
      }
    }

    // Create CandidateContact
    if (profile.contacts && profile.contacts.length > 0) {
      await prisma.candidateContact.createMany({
        data: profile.contacts.map((contact) => ({
          candidateId,
          ...contact,
        })),
      });
    }

    // Create CandidateSocial
    if (profile.socials && profile.socials.length > 0) {
      await prisma.candidateSocial.createMany({
        data: profile.socials.map((social) => ({
          candidateId,
          ...social,
        })),
      });
    }
  }
  console.log('Finished creating candidate profiles.');

  // Create companies
  console.log('Creating companies...');
  const nextCompanySlug = createUniqueSlugFactory();
  const createdCompanies = await Promise.all(
    company.map((company) =>
      prisma.company.create({
        data: {
          ...company,
          slug: nextCompanySlug(company.name),
        },
      })
    )
  );
  console.log(`Created ${createdCompanies.length} companies`);

  const companies = await prisma.company.findMany();

  // Ensure employers are linked to companies before posting jobs
  console.log('Ensuring employers are linked to companies...');
  const employerRecords: Employer[] = [];
  for (let i = 0; i < employers.length; i++) {
    const user = employers[i];
    let record = await prisma.employer.findUnique({
      where: { employerId: user.id },
    });

    if (!record) {
      record = await prisma.employer.create({
        data: {
          employerId: user.id,
          companyId: companies[i % companies.length].id,
          role: 'employer',
          assignedAt: new Date(),
        },
      });
    }
    employerRecords.push(record);
  }

  // Create job postings
  console.log('Creating job postings...');
  const createdJobPostings = await Promise.all(
    jobPosting.map((job, index) => {
      const employer = employerRecords[index % employerRecords.length];
      return prisma.jobPosting.create({
        data: {
          title: job.title,
          description: job.description,
          location: job.location,
          remote: job.remote,
          type: job.type as EmploymentType,
          status: job.status as JobStatus,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,

          // Use the correct relations from Employer record
          postedById: employer.employerId,
          companyId: employer.companyId!,
          categoryId: allCategories[index % allCategories.length].id,
        },
      });
    })
  );
  console.log(`Created ${createdJobPostings.length} job postings`);

  const jobPostings = await prisma.jobPosting.findMany();

  // Create job requirements
  console.log('Creating job requirements...');

  // Create a Map for faster skill lookups
  const getSkillId = (name: string): number => {
    const id = skillMap.get(name);
    if (id === undefined) {
      throw new Error(`Skill "${name}" not found`);
    }
    return id;
  };

  const jobRequirementsDataRaw = jobPosting.flatMap((job, jobIndex) =>
    job.jobRequirements.map((requirement) => ({
      jobPostingId: createdJobPostings[jobIndex].id,
      skillId: getSkillId(requirement.skillName.name),
      importance: requirement.importance as RequirementImportance,
      minYearsExperience: requirement.minYears,
    }))
  );

  // Deduplicate job requirements based on the unique constraint [jobPostingId, skillId]
  const uniqueJobRequirementsMap = new Map<
    string,
    (typeof jobRequirementsDataRaw)[0]
  >();
  jobRequirementsDataRaw.forEach((req) => {
    const key = `${req.jobPostingId}-${req.skillId}`;
    if (!uniqueJobRequirementsMap.has(key)) {
      uniqueJobRequirementsMap.set(key, req);
    }
  });

  const jobRequirementsData = Array.from(uniqueJobRequirementsMap.values());
  const removedCount =
    jobRequirementsDataRaw.length - jobRequirementsData.length;

  if (removedCount > 0) {
    console.log(`Removed ${removedCount} duplicate job requirements.`);
  }

  const jobRequirements = await prisma.jobRequirement.createMany({
    data: jobRequirementsData,
    skipDuplicates: true, // As a fallback
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
  const resumes = await Promise.all(
    resumeMetadata.map((meta, index) => {
      const candidate = jobSeekers[index % jobSeekers.length];
      return prisma.resume.create({
        data: {
          candidateId: candidate.id,
          fileKey: meta.fileKey,
          fileName: meta.fileName,
          fileType: 'application/pdf',
          fileSize: meta.fileSize,
          isDefault: index < jobSeekers.length,
        },
      });
    })
  );
  console.log(`Created ${resumes.length} resumes from metadata`);

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

  // Create account for Maria
  await prisma.account.create({
    data: {
      userId: maria.id,
      accountId: maria.email,
      providerId: 'credential',
      password: hashedPassword,
    },
  });
  console.log('Created user Maria Kelly');

  // Create Nomad company
  console.log('Creating Nomad company...');
  const nomad = await prisma.company.create({
    data: {
      name: 'Nomad',
      slug: nextCompanySlug('Nomad'),
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
  console.log('Setting up Carol White as HR...');
  const carol = allUsers.find((u) => u.email === 'carol@example.com');
  if (carol) {
    await prisma.employer.upsert({
      where: { employerId: carol.id },
      create: {
        companyId: companies[0].id, // Tech Corp
        employerId: carol.id,
        role: 'HR',
        assignedAt: new Date('2021-01-01'),
      },
      update: {
        companyId: companies[0].id,
        role: 'HR',
        assignedAt: new Date('2021-01-01'),
      },
    });
    console.log('Assigned Carol White as HR in Tech Corp');
  }

  console.log('Database seeding completed successfully!');
  console.log(`
Summary:
- Job Categories: ${allCategories.length}
- Skills: ${allSkills.length}
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
