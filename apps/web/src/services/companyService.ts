import { COMPANIES_BY_CATEGORY_MOCK } from '@/mocks/companies';
import { COMPANY_CATEGORIES } from '@/mocks/companyCategories';

export const companyService = {
  getCompaniesByCategory() {
    return COMPANIES_BY_CATEGORY_MOCK;
  },
  getCategories() {
    return COMPANY_CATEGORIES;
  },
};
