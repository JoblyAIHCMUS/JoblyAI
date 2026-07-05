import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ParsedResume } from './resume-parser.service';
import { AiProviderService } from './ai-provider.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ProfileSyncService {
  private readonly logger = new Logger(ProfileSyncService.name);

  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly aiProvider: AiProviderService
  ) {}

  @OnEvent('profile.item.updated')
  async handleItemUpdated(payload: {
    model: string;
    id: number;
    content: string;
  }) {
    // ... existing logic ...
  }

  @OnEvent('job.posting.updated')
  async handleJobPostingUpdated(payload: { id: number; content: string }) {
    this.logger.log(
      `Regenerating embedding for Job ID ${payload.id} (Background)`
    );
    try {
      const embedding = await this.aiProvider.generateEmbedding(
        payload.content
      );
      if (embedding && embedding.length > 0) {
        const vStr = `[${embedding.join(',')}]`;
        await this.prisma.$executeRawUnsafe(
          `UPDATE "JobPosting" SET embedding = $1::vector WHERE id = $2`,
          vStr,
          payload.id
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to regenerate embedding for Job ID ${payload.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private normalize(str: string): string {
    return str ? str.trim().toLowerCase() : '';
  }

  async regenerateBio(
    rawDescriptions: Record<string, string>
  ): Promise<string> {
    const sources = Object.values(rawDescriptions).filter(Boolean);
    if (sources.length === 0) return '';
    if (sources.length === 1) return sources[0];
    const prompt = `You are a Professional Resume Writer. Combine these professional summaries into one cohesive, punchy, and professional "About Me" paragraph: "${sources.join(
      ' | '
    )}".
    Rules:
    - Maximum 4 sentences.
    - Focus on core strengths, technologies, and impact.
    - Use a professional third-person narrative (avoid repeating the candidate's name if possible).
    - Return ONLY the text. No preamble, no explanation.`;
    return this.aiProvider.generateText(prompt);
  }

  async regenerateTitle(rawTitles: Record<string, string>): Promise<string> {
    const sources = Object.values(rawTitles).filter(Boolean);
    if (sources.length === 0) return '';
    if (sources.length === 1) return sources[0];
    const prompt = `You are an Expert Technical Recruiter. Based on these job titles/roles from a resume: "${sources.join(
      ', '
    )}", suggest ONE single, concise, and professional job title that best represents the candidate's current expertise and level.
    Rules:
    - Return ONLY the text of the title (e.g., "Full-Stack Developer").
    - NO introductory text, NO bullet points, NO multiple options.
    - Align seniority with the input (do not suggest "Senior" if the roles are "Intern", "Student", or "Junior").
    - Maximum 5 words.`;
    return this.aiProvider.generateText(prompt);
  }

  /**
   * Recalculates the aggregated values for a skill based on all linked resumes
   */
  private async recalculateSkillAggregate(
    tx: any,
    resumeIds: number[],
    skillName: string
  ) {
    const resumes = await tx.resume.findMany({
      where: { id: { in: resumeIds } },
      select: { parsedText: true },
    });

    let totalYears = 0;
    let highestLevel = 'NOVICE';

    for (const res of resumes) {
      if (!res.parsedText) continue;
      const data = JSON.parse(res.parsedText) as ParsedResume;
      const skills = data.skills || [];
      const skillMatch = skills.find(
        (s) => this.normalize(s.name) === this.normalize(skillName)
      );
      if (skillMatch) {
        totalYears += skillMatch.years || 0;
        highestLevel = this.compareSkillLevels(
          skillMatch.level as any,
          highestLevel as any
        );
      }
    }

    return { years: totalYears, level: highestLevel };
  }

  async commitMerge(candidateId: string, resumeId: number, data: ParsedResume) {
    this.logger.log(
      `Committing merge (Vector Mode) for candidate ${candidateId} and resume ${resumeId}`
    );

    const skills = data.skills || [];
    const experience = data.experience || [];
    const education = data.education || [];
    const certificates = data.certificates || [];

    // 1. Bio & Title
    const currentDesc = await this.prisma.candidateDescription.findUnique({
      where: { candidateId },
    });
    const rawDescriptions = {
      ...((currentDesc?.rawDescriptions as Record<string, string>) || {}),
    };
    const rawTitles = {
      ...((currentDesc?.rawTitles as Record<string, string>) || {}),
    };

    // If no AI sources exist but we have current data, treat it as a source to enable combination
    // This matches the logic in enrichWithDuplicateFlags for consistency
    if (Object.keys(rawDescriptions).length === 0 && currentDesc?.bio) {
      rawDescriptions['current'] = currentDesc.bio;
    }
    if (Object.keys(rawTitles).length === 0 && currentDesc?.title) {
      rawTitles['current'] = currentDesc.title;
    }

    // Check if user provided an edited bio in the draft data
    let finalBio = data.bio || '';
    let finalTitle = data.title || '';

    // Update source tracking using the ORIGINAL raw data, not the combined/edited one
    // This ensures future regenerations are accurate
    rawDescriptions[resumeId.toString()] = data.originalBio || data.bio || '';
    rawTitles[resumeId.toString()] = data.originalTitle || data.title || '';

    // If bio/title are empty in the draft (e.g. user cleared them), fallback to regeneration
    if (!finalBio) {
      finalBio = await this.regenerateBio(rawDescriptions);
    }
    if (!finalTitle) {
      finalTitle = await this.regenerateTitle(rawTitles);
    }

    const bioEmbedding = await this.aiProvider.generateEmbedding(finalBio);

    const resumeText = [
      finalTitle,
      finalBio,
      ...experience.map(
        (e) => `${e.jobTitle} at ${e.companyName}: ${e.description || ''}`
      ),
      ...skills.map((s) => s.name),
      ...education.map(
        (e) => `${e.degree || ''} ${e.fieldOfStudy || ''} at ${e.school}`
      ),
      ...certificates.map((c) => `${c.name} by ${c.issuer}`),
    ]
      .filter(Boolean)
      .join('\n');
    const resumeEmbedding = await this.aiProvider.generateEmbedding(resumeText);

    return this.prisma.$transaction(async (tx) => {
      // 1.1 Update description record (Regular fields)
      await tx.candidateDescription.upsert({
        where: { candidateId },
        create: {
          candidateId,
          title: finalTitle,
          bio: finalBio,
          rawDescriptions,
          rawTitles,
        },
        update: {
          title: finalTitle,
          bio: finalBio,
          rawDescriptions,
          rawTitles,
        },
      });

      // Update Bio embedding via Raw SQL for maximum stability
      if (bioEmbedding && bioEmbedding.length > 0) {
        const vStr = `[${bioEmbedding.join(',')}]`;
        await tx.$executeRawUnsafe(
          `UPDATE "CandidateDescription" SET embedding = $1::vector WHERE "candidateId" = $2`,
          vStr,
          candidateId
        );
      }

      // 2. Skills
      for (const s of skills) {
        const skill = await tx.skill.upsert({
          where: { name: this.normalize(s.name) },
          create: { name: this.normalize(s.name) },
          update: {},
        });
        const existing = await tx.candidateSkill.findUnique({
          where: { candidateId_skillId: { candidateId, skillId: skill.id } },
        });
        const sourceCvIds = existing
          ? [...new Set([...existing.sourceCvIds, resumeId])]
          : [resumeId];
        const { years, level } = await this.recalculateSkillAggregate(
          tx,
          sourceCvIds,
          s.name
        );

        await tx.candidateSkill.upsert({
          where: { candidateId_skillId: { candidateId, skillId: skill.id } },
          create: {
            candidateId,
            skillId: skill.id,
            level: level as any,
            years,
            sourceCvIds,
          },
          update: { level: level as any, years, sourceCvIds },
        });
      }

      // 3. Experience (Semantic Matching)
      for (const e of experience) {
        const content = `${e.companyName} | ${e.jobTitle} | ${e.description}`;
        const embedding = await this.aiProvider.generateEmbedding(content);

        let existingId: number | null = null;
        if (embedding && embedding.length > 0) {
          try {
            const vectorStr = `[${embedding.join(',')}]`;
            const similar: any[] = await tx.$queryRawUnsafe(
              `
              SELECT id, (embedding <=> $1::vector) as distance
              FROM "Experience"
              WHERE "candidateId" = $2
              ORDER BY distance ASC
              LIMIT 1
            `,
              vectorStr,
              candidateId
            );

            if (similar.length > 0 && similar[0].distance < 0.15) {
              existingId = similar[0].id;
            }
          } catch (dbError: any) {
            this.logger.error(
              `Error searching Experience vectors: ${dbError.message}`
            );
          }
        }

        if (existingId) {
          const existing = await tx.experience.findUnique({
            where: { id: existingId },
          });
          if (existing) {
            await tx.experience.update({
              where: { id: existingId },
              data: {
                jobTitle: e.jobTitle,
                companyName: e.companyName,
                description: e.description,
                startDate: new Date(e.startDate),
                endDate: e.endDate ? new Date(e.endDate) : null,
                type: e.type as any,
                location: e.location,
                sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])],
              },
            });

            if (embedding && embedding.length > 0) {
              await tx.$executeRawUnsafe(
                `UPDATE "Experience" SET embedding = $1::vector WHERE id = $2`,
                `[${embedding.join(',')}]`,
                existingId
              );
            }
          }
        } else {
          const created = await tx.experience.create({
            data: {
              candidateId,
              companyName: e.companyName,
              jobTitle: e.jobTitle,
              location: e.location || '',
              startDate: new Date(e.startDate),
              endDate: e.endDate ? new Date(e.endDate) : null,
              description: e.description || '',
              type: (e.type || 'OTHER') as any,
              sourceCvIds: [resumeId],
            },
          });

          if (embedding && embedding.length > 0) {
            await tx.$executeRawUnsafe(
              `UPDATE "Experience" SET embedding = $1::vector WHERE id = $2`,
              `[${embedding.join(',')}]`,
              created.id
            );
          }
        }
      }

      // 4. Education (Semantic Matching)
      for (const edu of education) {
        const content = `${edu.school} | ${edu.degree} | ${edu.fieldOfStudy}`;
        const embedding = await this.aiProvider.generateEmbedding(content);

        let existingId: number | null = null;
        if (embedding && embedding.length > 0) {
          try {
            const vectorStr = `[${embedding.join(',')}]`;
            const similar: any[] = await tx.$queryRawUnsafe(
              `
              SELECT id, (embedding <=> $1::vector) as distance
              FROM "Education"
              WHERE "candidateId" = $2
              ORDER BY distance ASC
              LIMIT 1
            `,
              vectorStr,
              candidateId
            );

            if (similar.length > 0 && similar[0].distance < 0.1) {
              existingId = similar[0].id;
            }
          } catch (dbError: any) {
            this.logger.error(
              `Error searching Education vectors: ${dbError.message}`
            );
          }
        }

        if (existingId) {
          const existing = await tx.education.findUnique({
            where: { id: existingId },
          });
          if (existing) {
            await tx.education.update({
              where: { id: existingId },
              data: {
                school: edu.school,
                degree: edu.degree as any,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: new Date(edu.startDate),
                endDate: edu.endDate ? new Date(edu.endDate) : null,
                grade: edu.grade,
                description: edu.description,
                sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])],
              },
            });

            if (embedding && embedding.length > 0) {
              await tx.$executeRawUnsafe(
                `UPDATE "Education" SET embedding = $1::vector WHERE id = $2`,
                `[${embedding.join(',')}]`,
                existingId
              );
            }
          }
        } else {
          const created = await tx.education.create({
            data: {
              candidateId,
              school: edu.school,
              degree: edu.degree as any,
              fieldOfStudy: edu.fieldOfStudy || '',
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              grade: edu.grade || '',
              description: edu.description || '',
              sourceCvIds: [resumeId],
            },
          });

          if (embedding && embedding.length > 0) {
            await tx.$executeRawUnsafe(
              `UPDATE "Education" SET embedding = $1::vector WHERE id = $2`,
              `[${embedding.join(',')}]`,
              created.id
            );
          }
        }
      }

      // 5. Certificates (Semantic Matching)
      for (const cert of certificates) {
        const content = `${cert.name} | ${cert.issuer}`;
        const embedding = await this.aiProvider.generateEmbedding(content);

        let existingId: number | null = null;
        if (embedding && embedding.length > 0) {
          try {
            const vectorStr = `[${embedding.join(',')}]`;
            const similar: any[] = await tx.$queryRawUnsafe(
              `
              SELECT id, (embedding <=> $1::vector) as distance
              FROM "Certificate"
              WHERE "candidateId" = $2
              ORDER BY distance ASC
              LIMIT 1
            `,
              vectorStr,
              candidateId
            );

            if (similar.length > 0 && similar[0].distance < 0.1) {
              existingId = similar[0].id;
            }
          } catch (dbError: any) {
            this.logger.error(
              `Error searching Certificate vectors: ${dbError.message}`
            );
          }
        }

        if (existingId) {
          const existing = await tx.certificate.findUnique({
            where: { id: existingId },
          });
          if (existing) {
            await tx.certificate.update({
              where: { id: existingId },
              data: {
                name: cert.name,
                issuer: cert.issuer,
                issueDate: new Date(cert.issueDate),
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])],
              },
            });

            if (embedding && embedding.length > 0) {
              await tx.$executeRawUnsafe(
                `UPDATE "Certificate" SET embedding = $1::vector WHERE id = $2`,
                `[${embedding.join(',')}]`,
                existingId
              );
            }
          }
        } else {
          // Destructure to remove metadata fields not present in DB
          const { isDuplicate, matchedId, ...certData } = cert;
          const created = await tx.certificate.create({
            data: {
              ...certData,
              candidateId,
              sourceCvIds: [resumeId],
              issueDate: new Date(cert.issueDate),
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
            },
          });

          if (embedding && embedding.length > 0) {
            await tx.$executeRawUnsafe(
              `UPDATE "Certificate" SET embedding = $1::vector WHERE id = $2`,
              `[${embedding.join(',')}]`,
              created.id
            );
          }
        }
      }

      // 6. Contacts & Socials (Deterministic matching)
      await this.syncCollection(
        tx,
        'candidateContact',
        data.contacts,
        candidateId,
        resumeId,
        (item) => ({
          value: { equals: item.value.trim(), mode: 'insensitive' },
          type: item.type,
        })
      );
      await this.syncCollection(
        tx,
        'candidateSocial',
        data.socials,
        candidateId,
        resumeId,
        (item) => ({
          url: { equals: item.url.trim(), mode: 'insensitive' },
          platform: item.platform,
        })
      );

      await tx.resume.update({
        where: { id: resumeId },
        data: { isSyncedToProfile: true, parsedText: JSON.stringify(data) },
      });

      if (resumeEmbedding && resumeEmbedding.length > 0) {
        await tx.$executeRawUnsafe(
          `UPDATE "Resume" SET embedding = $1::vector WHERE id = $2`,
          `[${resumeEmbedding.join(',')}]`,
          resumeId
        );
      }

      return { success: true };
    });
  }

  private async syncCollection(
    tx: any,
    model: string,
    items: any[],
    candidateId: string,
    resumeId: number,
    getWhereCriteria: (item: any) => any
  ) {
    if (!items) return;
    for (const item of items) {
      const where = getWhereCriteria(item);
      const existing = await tx[model].findFirst({
        where: { candidateId, ...where },
      });

      if (existing) {
        await tx[model].update({
          where: { id: existing.id },
          data: {
            sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])],
          },
        });
      } else {
        // Sanitize item by removing any metadata fields (isDuplicate, matchedId)
        const { isDuplicate, matchedId, ...cleanItem } = item;
        const createData = {
          ...cleanItem,
          candidateId,
          sourceCvIds: [resumeId],
        };

        if (createData.value) createData.value = createData.value.trim();
        if (createData.url) createData.url = createData.url.trim();
        if (createData.name) createData.name = createData.name.trim();
        if (createData.issuer) createData.issuer = createData.issuer.trim();

        if (item.issueDate) createData.issueDate = new Date(item.issueDate);
        if (item.expiryDate) createData.expiryDate = new Date(item.expiryDate);

        await tx[model].create({ data: createData });
      }
    }
  }

  /**
   * Enriches parsed resume data with isDuplicate flags by searching for semantic matches in the existing profile.
   * Uses a combination of Vector Search (Semantic) and String Matching (Deterministic Fallback).
   */
  async enrichWithDuplicateFlags(
    candidateId: string,
    data: ParsedResume
  ): Promise<ParsedResume> {
    this.logger.log(
      `Enriching parsed data with duplicate flags for candidate ${candidateId}`
    );
    const enriched = { ...data };

    // Load existing profile data for fallback string matching
    const profile = await this.prisma.user.findUnique({
      where: { id: candidateId },
      include: {
        experiences: true,
        education: true,
        certificates: true,
        candidateContacts: true,
        candidateSocials: true,
        candidateSkills: { include: { skill: true } },
      },
    });

    if (!profile) return enriched;

    // 1. Experience (Vector Search + String Match Fallback)
    if (Array.isArray(enriched.experience)) {
      for (const e of enriched.experience) {
        let matchedId: number | null = null;

        // Try Vector Search
        const content = `${e.companyName} | ${e.jobTitle} | ${e.description}`;
        const embedding = await this.aiProvider.generateEmbedding(content);
        if (embedding && embedding.length > 0) {
          const vectorStr = `[${embedding.join(',')}]`;
          const similar: any[] = await this.prisma.$queryRawUnsafe(
            `
            SELECT id, (embedding <=> $1::vector) as distance
            FROM "Experience"
            WHERE "candidateId" = $2 AND embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 1
          `,
            vectorStr,
            candidateId
          );

          if (similar.length > 0 && similar[0].distance < 0.15) {
            matchedId = similar[0].id;
          }
        }

        // Fallback: String Match
        if (!matchedId) {
          const matched = profile.experiences.find(
            (old) =>
              this.normalize(old.companyName) ===
                this.normalize(e.companyName) &&
              this.normalize(old.jobTitle) === this.normalize(e.jobTitle)
          );
          if (matched) matchedId = matched.id;
        }

        e.isDuplicate = !!matchedId;
        e.matchedId = matchedId;
      }
    }

    // 2. Education
    if (Array.isArray(enriched.education)) {
      for (const edu of enriched.education) {
        let matchedId: number | null = null;

        const content = `${edu.school} | ${edu.degree} | ${edu.fieldOfStudy}`;
        const embedding = await this.aiProvider.generateEmbedding(content);
        if (embedding && embedding.length > 0) {
          const vectorStr = `[${embedding.join(',')}]`;
          const similar: any[] = await this.prisma.$queryRawUnsafe(
            `
            SELECT id, (embedding <=> $1::vector) as distance
            FROM "Education"
            WHERE "candidateId" = $2 AND embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 1
          `,
            vectorStr,
            candidateId
          );
          if (similar.length > 0 && similar[0].distance < 0.1) {
            matchedId = similar[0].id;
          }
        }

        // Fallback: String Match
        if (!matchedId) {
          const matched = profile.education.find(
            (old) =>
              this.normalize(old.school) === this.normalize(edu.school) &&
              this.normalize(old.degree || '') ===
                this.normalize(edu.degree || '')
          );
          if (matched) matchedId = matched.id;
        }

        edu.isDuplicate = !!matchedId;
        edu.matchedId = matchedId;
      }
    }

    // 3. Certificates
    if (Array.isArray(enriched.certificates)) {
      for (const cert of enriched.certificates) {
        let matchedId: number | null = null;

        const content = `${cert.name} | ${cert.issuer}`;
        const embedding = await this.aiProvider.generateEmbedding(content);
        if (embedding && embedding.length > 0) {
          const vectorStr = `[${embedding.join(',')}]`;
          const similar: any[] = await this.prisma.$queryRawUnsafe(
            `
            SELECT id, (embedding <=> $1::vector) as distance
            FROM "Certificate"
            WHERE "candidateId" = $2 AND embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 1
          `,
            vectorStr,
            candidateId
          );
          if (similar.length > 0 && similar[0].distance < 0.1) {
            matchedId = similar[0].id;
          }
        }

        // Fallback: String Match
        if (!matchedId) {
          const matched = profile.certificates.find(
            (old) => this.normalize(old.name) === this.normalize(cert.name)
          );
          if (matched) matchedId = matched.id;
        }

        cert.isDuplicate = !!matchedId;
        cert.matchedId = matchedId;
      }
    }

    // 4. Skills (Exact match on normalized name)
    if (Array.isArray(enriched.skills)) {
      for (const s of enriched.skills) {
        const skillName = this.normalize(s.name);
        const existing = profile.candidateSkills.find(
          (cs) => this.normalize(cs.skill.name) === skillName
        );

        if (existing) {
          s.isDuplicate = true;
          s.matchedId = existing.skillId;
        } else {
          s.isDuplicate = false;
          s.matchedId = null;
        }
      }
    }

    // 5. Contacts (Deterministic match)
    if (Array.isArray(enriched.contacts)) {
      for (const c of enriched.contacts) {
        const existing = profile.candidateContacts.find(
          (old) =>
            this.normalize(old.value) === this.normalize(c.value) &&
            old.type === c.type
        );
        c.isDuplicate = !!existing;
        c.matchedId = existing?.id || null;
      }
    }

    // 6. Socials (Deterministic match)
    if (Array.isArray(enriched.socials)) {
      for (const s of enriched.socials) {
        const existing = profile.candidateSocials.find(
          (old) =>
            this.normalize(old.url) === this.normalize(s.url) &&
            old.platform === s.platform
        );
        s.isDuplicate = !!existing;
        s.matchedId = existing?.id || null;
      }
    }

    // 7. Bio & Title Regeneration Preview (Merged Result)
    const currentDesc = await this.prisma.candidateDescription.findUnique({
      where: { candidateId },
    });
    const rawDescriptions = {
      ...((currentDesc?.rawDescriptions as Record<string, string>) || {}),
    };
    const rawTitles = {
      ...((currentDesc?.rawTitles as Record<string, string>) || {}),
    };

    // If no AI sources exist but we have current data, treat it as a source to enable combination
    if (Object.keys(rawDescriptions).length === 0 && currentDesc?.bio) {
      rawDescriptions['current'] = currentDesc.bio;
    }
    if (Object.keys(rawTitles).length === 0 && currentDesc?.title) {
      rawTitles['current'] = currentDesc.title;
    }

    // Preserve original raw data for source tracking later
    enriched.originalBio = data.bio || '';
    enriched.originalTitle = data.title || '';

    // Temporarily add the new bio/title to the descriptions for preview purposes
    // We don't save this yet, it's just for the returned draft
    const tempRawDescriptions = {
      ...rawDescriptions,
      draft: enriched.originalBio,
    };
    const tempRawTitles = { ...rawTitles, draft: enriched.originalTitle };

    enriched.bio = await this.regenerateBio(tempRawDescriptions);
    enriched.title = await this.regenerateTitle(tempRawTitles);

    return enriched;
  }

  async getBioRegenerationPreview(
    candidateId: string,
    resumeId: number
  ): Promise<string | null> {
    const desc = await this.prisma.candidateDescription.findUnique({
      where: { candidateId },
    });
    if (!desc?.rawDescriptions) return null;
    const updatedRawDescriptions = {
      ...(desc.rawDescriptions as Record<string, string>),
    };
    delete updatedRawDescriptions[resumeId.toString()];
    return this.regenerateBio(updatedRawDescriptions);
  }

  async getTitleRegenerationPreview(
    candidateId: string,
    resumeId: number
  ): Promise<string | null> {
    const desc = await this.prisma.candidateDescription.findUnique({
      where: { candidateId },
    });
    if (!desc?.rawTitles) return null;
    const updatedRawTitles = { ...(desc.rawTitles as Record<string, string>) };
    delete updatedRawTitles[resumeId.toString()];
    return this.regenerateTitle(updatedRawTitles);
  }

  async handleResumeDeletion(
    candidateId: string,
    resumeId: number,
    shouldKeepData = false
  ) {
    this.logger.log(
      `[handleResumeDeletion] Start: resumeId=${resumeId}, candidateId=${candidateId}, keepData=${shouldKeepData}`
    );

    let finalBio = '';
    let finalTitle = '';
    let updatedRawDescriptions: Record<string, string> = {};
    let updatedRawTitles: Record<string, string> = {};
    let shouldClearEntirely = false;

    if (!shouldKeepData) {
      const desc = await this.prisma.candidateDescription.findUnique({
        where: { candidateId },
      });
      const currentRaw =
        (desc?.rawDescriptions as Record<string, string>) || {};
      const currentRawTitles =
        (desc?.rawTitles as Record<string, string>) || {};

      this.logger.log(
        `[handleResumeDeletion] Current raw sources: ${Object.keys(
          currentRaw
        ).join(', ')}`
      );

      updatedRawDescriptions = { ...currentRaw };
      updatedRawTitles = { ...currentRawTitles };

      const existedInSources = !!updatedRawDescriptions[resumeId.toString()];
      const existedInTitles = !!updatedRawTitles[resumeId.toString()];

      delete updatedRawDescriptions[resumeId.toString()];
      delete updatedRawTitles[resumeId.toString()];

      const remainingSourcesCount = Object.keys(updatedRawDescriptions).length;

      if (remainingSourcesCount === 0) {
        this.logger.log(
          `[handleResumeDeletion] No source descriptions remain. Flagging for total reset.`
        );
        shouldClearEntirely = true;
        finalBio = '';
        finalTitle = '';
      } else {
        if (existedInSources) {
          this.logger.log(
            `[handleResumeDeletion] ${remainingSourcesCount} sources remain. Regenerating bio.`
          );
          finalBio = await this.regenerateBio(updatedRawDescriptions);
        } else {
          finalBio = desc?.bio || '';
        }

        if (existedInTitles) {
          this.logger.log(
            `[handleResumeDeletion] ${remainingSourcesCount} sources remain. Regenerating title.`
          );
          finalTitle = await this.regenerateTitle(updatedRawTitles);
        } else {
          finalTitle = desc?.title || '';
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const models = [
        'candidateSkill',
        'experience',
        'education',
        'candidateContact',
        'candidateSocial',
        'certificate',
      ];
      for (const model of models) {
        const records = await (tx as any)[model].findMany({
          where: { candidateId, sourceCvIds: { has: resumeId } },
        });
        for (const record of records) {
          const remainingIds = record.sourceCvIds.filter(
            (id: number) => id !== resumeId
          );

          if (shouldKeepData) {
            await (tx as any)[model].update({
              where: { id: record.id },
              data: { sourceCvIds: remainingIds },
            });
          } else {
            if (remainingIds.length === 0) {
              await (tx as any)[model].delete({ where: { id: record.id } });
            } else {
              let updateData: any = { sourceCvIds: remainingIds };
              if (model === 'candidateSkill') {
                const skill = await tx.skill.findUnique({
                  where: { id: record.skillId },
                });
                const { years, level } = await this.recalculateSkillAggregate(
                  tx,
                  remainingIds,
                  skill?.name || ''
                );
                updateData = { ...updateData, years, level };
              } else if (
                model === 'experience' ||
                model === 'education' ||
                model === 'certificate'
              ) {
                const bestData = await this.getBestRecordFromSources(
                  tx,
                  model,
                  remainingIds,
                  record
                );
                updateData = { ...updateData, ...bestData };
              }
              await (tx as any)[model].update({
                where: { id: record.id },
                data: updateData,
              });
            }
          }
        }
      }

      // Bio & Title Cleanup (only if PURGING)
      if (!shouldKeepData) {
        if (shouldClearEntirely) {
          this.logger.log(
            `[handleResumeDeletion] Performing TOTAL RESET via Raw SQL for candidate ${candidateId}`
          );
          // Definitive clear including vector embedding
          await tx.$executeRawUnsafe(
            `UPDATE "CandidateDescription" 
             SET bio = '', title = '', embedding = NULL, "rawDescriptions" = '{}'::jsonb, "rawTitles" = '{}'::jsonb 
             WHERE "candidateId" = $1`,
            candidateId
          );
        } else if (Object.keys(updatedRawDescriptions).length > 0) {
          this.logger.log(
            `[handleResumeDeletion] Updating CandidateDescription with ${
              Object.keys(updatedRawDescriptions).length
            } sources.`
          );
          await tx.candidateDescription.upsert({
            where: { candidateId },
            create: {
              candidateId,
              rawDescriptions: updatedRawDescriptions,
              rawTitles: updatedRawTitles,
              bio: finalBio,
              title: finalTitle,
            },
            update: {
              rawDescriptions: updatedRawDescriptions,
              rawTitles: updatedRawTitles,
              bio: finalBio,
              title: finalTitle,
            },
          });
        }
      }

      this.logger.log(
        `[handleResumeDeletion] Finished successfully for resume ${resumeId}`
      );
      return { success: true };
    });
  }

  private async getBestRecordFromSources(
    tx: any,
    model: string,
    remainingResumeIds: number[],
    currentRecord: any
  ): Promise<any> {
    const resumes = await tx.resume.findMany({
      where: { id: { in: remainingResumeIds } },
      select: { parsedText: true },
    });
    const sourceDataList = resumes.map(
      (r: { parsedText: string | null }) =>
        JSON.parse(r.parsedText || '{}') as ParsedResume
    );
    const field =
      model === 'experience'
        ? 'experience'
        : model === 'education'
        ? 'education'
        : 'certificates';
    const keyField =
      model === 'experience'
        ? 'companyName'
        : model === 'education'
        ? 'school'
        : 'name';

    const matches = sourceDataList
      .flatMap((d: any) => d[field] || [])
      .filter(
        (m: any) =>
          this.normalize(m[keyField]) ===
          this.normalize(currentRecord[keyField])
      );

    const bestMatch = matches.reduce(
      (best: any, curr: any) =>
        curr.description?.length > (best.description?.length || 0)
          ? curr
          : best,
      matches[0] || {}
    );

    if (!bestMatch) return {};

    // Sanitize by removing metadata fields and unneeded properties
    const { isDuplicate, matchedId, ...cleanMatch } = bestMatch;
    const result = { ...cleanMatch };

    if (result.startDate) result.startDate = new Date(result.startDate);
    if (result.endDate) result.endDate = new Date(result.endDate);
    if (result.issueDate) result.issueDate = new Date(result.issueDate);
    if (result.expiryDate) result.expiryDate = new Date(result.expiryDate);

    return result;
  }

  private compareSkillLevels(a: string, b: string): string {
    const levels: Record<string, number> = {
      NOVICE: 0,
      BEGINNER: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3,
      MASTER: 4,
    };
    return (levels[a] || 0) >= (levels[b] || 0) ? a : b;
  }
}
