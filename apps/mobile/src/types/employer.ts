import { Company } from './company';

export interface EmployerProfileResponse {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  company?: Company;
  isCompanyAdmin: boolean;
}
