import { Experience } from "../types";
import { CandidateExperience, CreateExperiencePayload, UpdateExperiencePayload } from "@/api-client/candidate/types";

export function mapApiExperienceToUI(experience: CandidateExperience): Experience {
    return {
        id: experience.id,
        company: experience.companyName || '',
        role: experience.jobTitle || '',
        logo: experience.urlLogo || 'https://placehold.co/80x80',
        type: experience.type || 'Full-Time', // Assuming type is not provided by API, default to 'Full-Time'
        startDate: experience.startDate,
        endDate: experience.endDate,
        location: experience.location || '',
        desc: experience.description || '',
    };
}

export function mapApiExperiencesToUI(experiences: CandidateExperience[]): Experience[] {
    return experiences.map(mapApiExperienceToUI);
}

export function mapUIToApiCreate(exp: Experience): CreateExperiencePayload {
    return {
        companyName: exp.company,
        jobTitle: exp.role,
        urlLogo: exp.logo,
        type: exp.type,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.desc,
    };
}

export function mapUIToApiUpdate(exp: Experience): UpdateExperiencePayload {
    return {
        id: exp.id,
        ...mapUIToApiCreate(exp),
    };
}
