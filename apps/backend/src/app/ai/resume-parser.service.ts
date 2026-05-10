import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';

export interface ParsedResume {
  title: string;
  bio: string;
  skills: { name: string; years?: number; level?: string }[];
  education: {
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    grade?: string;
    description?: string;
  }[];
  experience: {
    companyName: string;
    jobTitle: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
    type?: string;
  }[];
  contacts: {
    type: string;
    value: string;
  }[];
  socials: {
    platform: string;
    url: string;
  }[];
  certificates: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
  }[];
}

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  async extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
    try {
      // Use dynamic import for pdfjs-dist as it is an ESM module
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      
      const data = new Uint8Array(fileBuffer);
      const loadingTask = pdfjs.getDocument({
        data,
        useSystemFonts: true,
        disableFontFace: true,
      });
      
      const pdf = await loadingTask.promise;
      this.logger.log(`PDF loaded. Number of pages: ${pdf.numPages}`);
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      const cleanText = fullText.trim();
      this.logger.log(`PDF extraction complete. Text length: ${cleanText.length}`);
      
      if (cleanText.length < 50) {
        this.logger.warn('Extracted text is very short. PDF might be scanned/image-based or empty.');
      }

      return cleanText;
    } catch (error: any) {
      this.logger.error(`Error parsing PDF with pdfjs-dist: ${error.message}`);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async parseResumeText(text: string): Promise<{ data: ParsedResume; embedding: number[] }> {
    const prompt = `
      You are a Senior Technical Recruiter and Expert Resume Parser. Your task is to extract high-fidelity structured data from the provided resume text.

      RESUME TEXT TO PROCESS:
      ---
      ${text}
      ---

      EXTRACTION RULES:
      1. SKILL CALCULATION & LEVEL:
         - 'years': Calculate by summing the durations (months/years) of all work experiences where the skill was explicitly used. Round to nearest integer.
         - MASTER: 7+ years of experience OR clear architectural/leadership impact with the skill.
         - ADVANCED: 4-7 years of experience OR specialized/deep technical implementation.
         - INTERMEDIATE: 2-4 years of experience OR consistent professional use.
         - BEGINNER: 1-2 years of experience OR limited professional exposure.
         - NOVICE: < 1 year of experience OR academic/personal project use only.

      2. DATE HANDLING:
         - Standardize all dates to YYYY-MM-DD.
         - If only a year is provided, use YYYY-01-01.
         - If "Present" is used, set endDate to null.

      3. ENUM STRICTNESS:
         - Degree: MUST be one of [HIGH_SCHOOL, DIPLOMA, ASSOCIATE, BACHELOR, MASTER, PHD, OTHER].
         - Experience Type: MUST be one of [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, ONSITE, REMOTE, HYBRID, OTHER].
         - Contact Type: MUST be one of [PHONE, EMAIL, FAX, WEBSITE, LINKEDIN, GITHUB, OTHER].
         - Social Platform: MUST be one of [LINKEDIN, GITHUB, FACEBOOK, TWITTER, INSTAGRAM, YOUTUBE, TIKTOK, DRIBBBLE, BEHANCE, OTHER].

      4. MISSING DATA HANDLING:
         - If 'companyName' is missing: Look for project names or use 'Independent/Freelance/Personal Project' base on the characteristic of the description. Do NOT use 'unknown'.
         - If 'jobTitle' is missing: Infer from description.
         - If 'location' is missing: Use 'Unknown'

      5. CONTENT QUALITY:
         - 'bio': Summarize the candidate's professional identity into a punchy 2-3 sentence paragraph IF THERE IS NO DESCRIPTION ABOUT BIO IN CV.

      RETURN FORMAT:
      Return a valid JSON object strictly following this structure:
      {
        "title": "string",
        "bio": "string",
        "skills": [{"name": "string", "years": number, "level": "ENUM"}],
        "education": [{"school": "string", "degree": "ENUM", "fieldOfStudy": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD|null", "grade": "string", "description": "string"}],
        "experience": [{"companyName": "string", "jobTitle": "string", "location": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD|null", "description": "string", "type": "ENUM"}],
        "contacts": [{"type": "ENUM", "value": "string"}],
        "socials": [{"platform": "ENUM", "url": "string"}],
        "certificates": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM-DD", "expiryDate": "YYYY-MM-DD|null"}]
      }
    `;

    this.logger.log(`Calling Gemini API for resume extraction. Prompt length: ${prompt.length}`);
    const result = await this.aiProvider.generateStructuredData<ParsedResume>(prompt);

    // 3. Generate Embedding for the whole resume (RAG Readiness)
    let resumeEmbedding: number[] = [];
    try {
      this.logger.log('Generating full-resume embedding...');
      resumeEmbedding = await this.aiProvider.generateEmbedding(text);
    } catch (error: any) {
      this.logger.error(`Failed to generate resume embedding: ${error.message}`);
    }
    
    // Log a summary of extracted data
    this.logger.log(`Extraction complete for resume. Found: ${result?.skills?.length || 0} skills, ${result?.experience?.length || 0} experiences, ${result?.education?.length || 0} educations.`);
    
    return {
      data: result,
      embedding: resumeEmbedding
    };
  }
}
