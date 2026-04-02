import { CreateEducationPayload, UpdateEducationPayload, CreateExperiencePayload, UpdateExperiencePayload, CandidateProfileResponse } from "@/api-client/candidate";
import { CandidateEducation, CandidateExperience } from "@/types/profile";
import { CandidateProfileUI } from "./types";

export function mapUIToApiCreateEducation(education: CandidateEducation): CreateEducationPayload {
    return {
        school: education.school,
        degree: education.degree,
        fieldOfStudy: education.fieldOfStudy || "",
        startDate: education.startDate,
        endDate: education.endDate,
        grade: education.grade,
        description: education.description,
    };
}

export function mapUIToApiUpdateEducation(education: CandidateEducation): UpdateEducationPayload {
    return {
        id: education.id,
        ...mapUIToApiCreateEducation(education),
    };
}


export function mapUIToApiCreateExperience(exp: CandidateExperience): CreateExperiencePayload {
    return {
        companyName: exp.companyName,
        jobTitle: exp.jobTitle,
        type: exp.type,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
    };
}

export function mapUIToApiUpdateExperience(exp: CandidateExperience): UpdateExperiencePayload {
    return {
        id: exp.id,
        ...mapUIToApiCreateExperience(exp),
    };
}

export function mapDataToCandidate(data: CandidateProfileResponse): CandidateProfileUI {
    return {
        name: data.name || '',
        title: data.role || '',
        avatar: data.image || '',
        banner: '#4640DE',
        openForOpportunities: data.openForOpportunities || false,
        about: data.about || [data.email] || [],
        experiences: data.experiences || [],
        educations: data.educations || [],
        skills: data.skills || [],
        portfolios: data.portfolios || [],
        contact: {
            email: data.email || '',
            phone: data.contact?.phone || '',
        },
        socials: data.socials || [],
    };
}