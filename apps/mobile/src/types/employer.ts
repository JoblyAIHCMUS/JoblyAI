import { Company } from './company';

export interface EmployerProfileResponse {
  id: string;
  fullName: string;
  company?: Company;
}
