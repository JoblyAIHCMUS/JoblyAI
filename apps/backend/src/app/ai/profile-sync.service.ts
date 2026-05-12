import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ParsedResume } from './resume-parser.service';
import { AiProviderService } from './ai-provider.service';

@Injectable()
export class ProfileSyncService {
  private readonly logger = new Logger(ProfileSyncService.name);

  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly aiProvider: AiProviderService,
  ) {}

  private normalize(str: string): string {
    return str ? str.trim().toLowerCase() : '';
  }

  async regenerateBio(rawDescriptions: Record<string, string>): Promise<string> {
    const sources = Object.values(rawDescriptions).filter(Boolean);
    if (sources.length === 0) return '';
    if (sources.length === 1) return sources[0];
    const prompt = `Combine these resume summaries into one professional bio (max 4 sentences): ${sources.join(' | ')}`;
    return this.aiProvider.generateText(prompt);
  }

  /**
   * Recalculates the aggregated values for a skill based on all linked resumes
   */
  private async recalculateSkillAggregate(tx: any, resumeIds: number[], skillName: string) {
    const resumes = await tx.resume.findMany({
      where: { id: { in: resumeIds } },
      select: { parsedText: true }
    });

    let totalYears = 0;
    let highestLevel = 'NOVICE';

    for (const res of resumes) {
      if (!res.parsedText) continue;
      const data = JSON.parse(res.parsedText) as ParsedResume;
      const skills = data.skills || [];
      const skillMatch = skills.find(s => this.normalize(s.name) === this.normalize(skillName));
      if (skillMatch) {
        totalYears += (skillMatch.years || 0);
        highestLevel = this.compareSkillLevels(skillMatch.level as any, highestLevel as any);
      }
    }

    return { years: totalYears, level: highestLevel };
  }

  async commitMerge(candidateId: string, resumeId: number, data: ParsedResume) {
    this.logger.log(`Committing merge (Vector Mode) for candidate ${candidateId} and resume ${resumeId}`);
    
    const skills = data.skills || [];
    const experience = data.experience || [];
    const education = data.education || [];
    const certificates = data.certificates || [];

    // 1. Pre-calculate Bio & Title
    const currentDesc = await this.prisma.candidateDescription.findUnique({ where: { candidateId } });
    const rawDescriptions = (currentDesc?.rawDescriptions as Record<string, string>) || {};
    rawDescriptions[resumeId.toString()] = data.bio || '';
    const finalBio = await this.regenerateBio(rawDescriptions);
    const bioEmbedding = await this.aiProvider.generateEmbedding(finalBio);

    return this.prisma.$transaction(async (tx) => {
      // 1.1 Update description record (Regular fields)
      await tx.candidateDescription.upsert({
        where: { candidateId },
        create: { 
          candidateId, 
          title: data.title || '', 
          bio: finalBio, 
          rawDescriptions,
        },
        update: { 
          title: data.title || '', 
          bio: finalBio, 
          rawDescriptions,
        },
      });

      // Update Bio embedding via Raw SQL for maximum stability
      if (bioEmbedding && bioEmbedding.length > 0) {
        const vStr = `[${bioEmbedding.join(',')}]`;
        await tx.$executeRawUnsafe(
          `UPDATE "CandidateDescription" SET embedding = $1::vector WHERE "candidateId" = $2`,
          vStr, candidateId
        );
      }

      // 2. Skills
      for (const s of skills) {
        const skill = await tx.skill.upsert({ where: { name: this.normalize(s.name) }, create: { name: this.normalize(s.name) }, update: {} });
        const existing = await tx.candidateSkill.findUnique({ where: { candidateId_skillId: { candidateId, skillId: skill.id } } });
        const sourceCvIds = existing ? [...new Set([...existing.sourceCvIds, resumeId])] : [resumeId];
        const { years, level } = await this.recalculateSkillAggregate(tx, sourceCvIds, s.name);
        
        await tx.candidateSkill.upsert({
          where: { candidateId_skillId: { candidateId, skillId: skill.id } },
          create: { candidateId, skillId: skill.id, level: level as any, years, sourceCvIds },
          update: { level: level as any, years, sourceCvIds }
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
            const similar: any[] = await tx.$queryRawUnsafe(`
              SELECT id, (embedding <=> $1::vector) as distance
              FROM "Experience"
              WHERE "candidateId" = $2
              ORDER BY distance ASC
              LIMIT 1
            `, vectorStr, candidateId);

            if (similar.length > 0 && similar[0].distance < 0.15) {
              existingId = similar[0].id;
            }
          } catch (dbError: any) {
            this.logger.error(`Error searching Experience vectors: ${dbError.message}`);
          }
        }

        if (existingId) {
          const existing = await tx.experience.findUnique({ where: { id: existingId } });
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
                sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])] 
              } 
            });
            
            if (embedding && embedding.length > 0) {
              await tx.$executeRawUnsafe(
                `UPDATE "Experience" SET embedding = $1::vector WHERE id = $2`,
                `[${embedding.join(',')}]`, existingId
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
            }
          });

          if (embedding && embedding.length > 0) {
            await tx.$executeRawUnsafe(
              `UPDATE "Experience" SET embedding = $1::vector WHERE id = $2`,
              `[${embedding.join(',')}]`, created.id
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
            const similar: any[] = await tx.$queryRawUnsafe(`
              SELECT id, (embedding <=> $1::vector) as distance
              FROM "Education"
              WHERE "candidateId" = $2
              ORDER BY distance ASC
              LIMIT 1
            `, vectorStr, candidateId);

            if (similar.length > 0 && similar[0].distance < 0.1) {
              existingId = similar[0].id;
            }
          } catch (dbError: any) {
            this.logger.error(`Error searching Education vectors: ${dbError.message}`);
          }
        }

        if (existingId) {
          const existing = await tx.education.findUnique({ where: { id: existingId } });
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
                sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])] 
              } 
            });

            if (embedding && embedding.length > 0) {
              await tx.$executeRawUnsafe(
                `UPDATE "Education" SET embedding = $1::vector WHERE id = $2`,
                `[${embedding.join(',')}]`, existingId
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
            }
          });

          if (embedding && embedding.length > 0) {
            await tx.$executeRawUnsafe(
              `UPDATE "Education" SET embedding = $1::vector WHERE id = $2`,
              `[${embedding.join(',')}]`, created.id
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
            const similar: any[] = await tx.$queryRawUnsafe(`
              SELECT id, (embedding <=> $1::vector) as distance
              FROM "Certificate"
              WHERE "candidateId" = $2
              ORDER BY distance ASC
              LIMIT 1
            `, vectorStr, candidateId);

            if (similar.length > 0 && similar[0].distance < 0.1) {
              existingId = similar[0].id;
            }
          } catch (dbError: any) {
            this.logger.error(`Error searching Certificate vectors: ${dbError.message}`);
          }
        }

        if (existingId) {
          const existing = await tx.certificate.findUnique({ where: { id: existingId } });
          if (existing) {
            await tx.certificate.update({ 
              where: { id: existingId }, 
              data: { 
                name: cert.name,
                issuer: cert.issuer,
                issueDate: new Date(cert.issueDate),
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])] 
              } 
            });

            if (embedding && embedding.length > 0) {
              await tx.$executeRawUnsafe(
                `UPDATE "Certificate" SET embedding = $1::vector WHERE id = $2`,
                `[${embedding.join(',')}]`, existingId
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
            }
          });

          if (embedding && embedding.length > 0) {
            await tx.$executeRawUnsafe(
              `UPDATE "Certificate" SET embedding = $1::vector WHERE id = $2`,
              `[${embedding.join(',')}]`, created.id
            );
          }
        }
      }

      // 6. Contacts & Socials (Deterministic matching)
      await this.syncCollection(tx, 'candidateContact', data.contacts, candidateId, resumeId, (item) => ({ 
        value: { equals: item.value.trim(), mode: 'insensitive' }, 
        type: item.type 
      }));
      await this.syncCollection(tx, 'candidateSocial', data.socials, candidateId, resumeId, (item) => ({ 
        url: { equals: item.url.trim(), mode: 'insensitive' }, 
        platform: item.platform 
      }));

      await tx.resume.update({ where: { id: resumeId }, data: { isSyncedToProfile: true } });
      return { success: true };
    });
  }

  private async syncCollection(tx: any, model: string, items: any[], candidateId: string, resumeId: number, getWhereCriteria: (item: any) => any) {
    if (!items) return;
    for (const item of items) {
      const where = getWhereCriteria(item);
      const existing = await tx[model].findFirst({ where: { candidateId, ...where } });
      
      if (existing) {
        await tx[model].update({ 
          where: { id: existing.id }, 
          data: { sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])] } 
        });
      } else {
        // Sanitize item by removing any metadata fields (isDuplicate, matchedId)
        const { isDuplicate, matchedId, ...cleanItem } = item;
        const createData = { 
          ...cleanItem, 
          candidateId, 
          sourceCvIds: [resumeId] 
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
  async enrichWithDuplicateFlags(candidateId: string, data: ParsedResume): Promise<ParsedResume> {
    this.logger.log(`Enriching parsed data with duplicate flags for candidate ${candidateId}`);
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
        candidateSkills: { include: { skill: true } }
      }
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
          const similar: any[] = await this.prisma.$queryRawUnsafe(`
            SELECT id, (embedding <=> $1::vector) as distance
            FROM "Experience"
            WHERE "candidateId" = $2 AND embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 1
          `, vectorStr, candidateId);
          
          if (similar.length > 0 && similar[0].distance < 0.15) {
            matchedId = similar[0].id;
          }
        }

        // Fallback: String Match
        if (!matchedId) {
          const matched = profile.experiences.find(old => 
            this.normalize(old.companyName) === this.normalize(e.companyName) &&
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
          const similar: any[] = await this.prisma.$queryRawUnsafe(`
            SELECT id, (embedding <=> $1::vector) as distance
            FROM "Education"
            WHERE "candidateId" = $2 AND embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 1
          `, vectorStr, candidateId);
          if (similar.length > 0 && similar[0].distance < 0.1) {
            matchedId = similar[0].id;
          }
        }

        // Fallback: String Match
        if (!matchedId) {
          const matched = profile.education.find(old => 
            this.normalize(old.school) === this.normalize(edu.school) &&
            this.normalize(old.degree || '') === this.normalize(edu.degree || '')
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
          const similar: any[] = await this.prisma.$queryRawUnsafe(`
            SELECT id, (embedding <=> $1::vector) as distance
            FROM "Certificate"
            WHERE "candidateId" = $2 AND embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 1
          `, vectorStr, candidateId);
          if (similar.length > 0 && similar[0].distance < 0.1) {
            matchedId = similar[0].id;
          }
        }

        // Fallback: String Match
        if (!matchedId) {
          const matched = profile.certificates.find(old => 
            this.normalize(old.name) === this.normalize(cert.name)
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
        const existing = profile.candidateSkills.find(cs => this.normalize(cs.skill.name) === skillName);
        
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
        const existing = profile.candidateContacts.find(old => 
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
        const existing = profile.candidateSocials.find(old => 
          this.normalize(old.url) === this.normalize(s.url) &&
          old.platform === s.platform
        );
        s.isDuplicate = !!existing;
        s.matchedId = existing?.id || null;
      }
    }

    return enriched;
  }

  async getBioRegenerationPreview(candidateId: string, resumeId: number): Promise<string | null> {
    const desc = await this.prisma.candidateDescription.findUnique({ where: { candidateId } });
    if (!desc?.rawDescriptions) return null;
    const updatedRawDescriptions = { ...(desc.rawDescriptions as Record<string, string>) };
    delete updatedRawDescriptions[resumeId.toString()];
    return this.regenerateBio(updatedRawDescriptions);
  }

  async handleResumeDeletion(candidateId: string, resumeId: number, shouldKeepData = false) {
    this.logger.log(`[handleResumeDeletion] Start: resumeId=${resumeId}, candidateId=${candidateId}, keepData=${shouldKeepData}`);
    
    let finalBio: string = '';
    let finalTitle: string = '';
    let updatedRawDescriptions: Record<string, string> = {};
    let shouldClearEntirely = false;

    if (!shouldKeepData) {
      const desc = await this.prisma.candidateDescription.findUnique({ where: { candidateId } });
      const currentRaw = (desc?.rawDescriptions as Record<string, string>) || {};
      
      this.logger.log(`[handleResumeDeletion] Current raw sources: ${Object.keys(currentRaw).join(', ')}`);
      
      updatedRawDescriptions = { ...currentRaw };
      const existedInSources = !!updatedRawDescriptions[resumeId.toString()];
      delete updatedRawDescriptions[resumeId.toString()];
      
      const remainingSourcesCount = Object.keys(updatedRawDescriptions).length;
      
      if (remainingSourcesCount === 0) {
        this.logger.log(`[handleResumeDeletion] No source descriptions remain. Flagging for total reset.`);
        shouldClearEntirely = true;
        finalBio = '';
        finalTitle = '';
      } else if (existedInSources) {
        this.logger.log(`[handleResumeDeletion] ${remainingSourcesCount} sources remain. Regenerating bio.`);
        finalBio = await this.regenerateBio(updatedRawDescriptions);
        finalTitle = desc?.title || '';
      } else {
        // Not in sources, check if any resumes remain at all
        const remainingResumesCount = await this.prisma.resume.count({ where: { candidateId } });
        if (remainingResumesCount === 0) {
          shouldClearEntirely = true;
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const models = ['candidateSkill', 'experience', 'education', 'candidateContact', 'candidateSocial', 'certificate'];
      for (const model of models) {
        const records = await (tx as any)[model].findMany({ where: { candidateId, sourceCvIds: { has: resumeId } } });
        for (const record of records) {
          const remainingIds = record.sourceCvIds.filter((id: number) => id !== resumeId);
          
          if (shouldKeepData) {
            await (tx as any)[model].update({ where: { id: record.id }, data: { sourceCvIds: remainingIds } });
          } else {
            if (remainingIds.length === 0) {
              await (tx as any)[model].delete({ where: { id: record.id } });
            } else {
              let updateData: any = { sourceCvIds: remainingIds };
              if (model === 'candidateSkill') {
                const skill = await tx.skill.findUnique({ where: { id: record.skillId } });
                const { years, level } = await this.recalculateSkillAggregate(tx, remainingIds, skill?.name || '');
                updateData = { ...updateData, years, level };
              } else if (model === 'experience' || model === 'education' || model === 'certificate') {
                const bestData = await this.getBestRecordFromSources(tx, model, remainingIds, record);
                updateData = { ...updateData, ...bestData };
              }
              await (tx as any)[model].update({ where: { id: record.id }, data: updateData });
            }
          }
        }
      }

      // Bio & Title Cleanup (only if PURGING)
      if (!shouldKeepData) {
        if (shouldClearEntirely) {
          this.logger.log(`[handleResumeDeletion] Performing TOTAL RESET via Raw SQL for candidate ${candidateId}`);
          // Definitive clear including vector embedding
          await tx.$executeRawUnsafe(
            `UPDATE "CandidateDescription" 
             SET bio = '', title = '', embedding = NULL, "rawDescriptions" = '{}'::jsonb 
             WHERE "candidateId" = $1`,
            candidateId
          );
        } else if (Object.keys(updatedRawDescriptions).length > 0) {
          this.logger.log(`[handleResumeDeletion] Updating CandidateDescription with ${Object.keys(updatedRawDescriptions).length} sources.`);
          await tx.candidateDescription.upsert({
            where: { candidateId },
            create: { 
              candidateId,
              rawDescriptions: updatedRawDescriptions,
              bio: finalBio,
              title: finalTitle
            },
            update: { 
              rawDescriptions: updatedRawDescriptions, 
              bio: finalBio, 
              title: finalTitle
            }
          });
        }
      }

      this.logger.log(`[handleResumeDeletion] Finished successfully for resume ${resumeId}`);
      return { success: true };
    });
  }

  private async getBestRecordFromSources(tx: any, model: string, remainingResumeIds: number[], currentRecord: any): Promise<any> {
    const resumes = await tx.resume.findMany({ where: { id: { in: remainingResumeIds } }, select: { parsedText: true } });
    const sourceDataList = resumes.map((r: { parsedText: string | null }) => JSON.parse(r.parsedText || '{}') as ParsedResume);
    const field = model === 'experience' ? 'experience' : model === 'education' ? 'education' : 'certificates';
    const keyField = model === 'experience' ? 'companyName' : model === 'education' ? 'school' : 'name';
    
    const matches = sourceDataList.flatMap((d: any) => d[field] || []).filter((m: any) => this.normalize(m[keyField]) === this.normalize(currentRecord[keyField]));
    
    const bestMatch = matches.reduce((best: any, curr: any) => (curr.description?.length > (best.description?.length || 0) ? curr : best), matches[0] || {});
    
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
    const levels: Record<string, number> = { 'NOVICE': 0, 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3, 'MASTER': 4 };
    return (levels[a] || 0) >= (levels[b] || 0) ? a : b;
  }
}
