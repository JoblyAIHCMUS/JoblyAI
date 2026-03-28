export interface Company {
	id: number;
	name: string;
	websiteUrl: string | null;
	sizeRange: string | null;
	industry: string | null;
	description: string | null;
	logoUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateCompanyPayload {
	name: string;
	websiteUrl?: string;
	sizeRange?: string;
	industry?: string;
	description?: string;
	logoUrl?: string;
}

export interface UpdateCompanyPayload {
	name: string;
	websiteUrl?: string;
	sizeRange?: string;
	industry?: string;
	description?: string;
	logoUrl?: string;
}

export interface PatchCompanyPayload {
	name?: string;
	websiteUrl?: string;
	sizeRange?: string;
	industry?: string;
	description?: string;
	logoUrl?: string;
}
