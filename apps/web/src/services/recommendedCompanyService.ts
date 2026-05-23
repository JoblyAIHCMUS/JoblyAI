import { getRecommendedCompanies } from '@/api-client/company';
import type { RecommendedCompany } from '@/types/recommendedCompany';

export const recommendedCompanyService = {
  async getRecommendedCompanies(): Promise<RecommendedCompany[]> {
    try {
      const companies = await getRecommendedCompanies(6);
      return companies;
    } catch (error) {
      console.error('Failed to fetch recommended companies:', error);
      return [];
    }
  },
};
