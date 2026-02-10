export interface JobPosting {
  id: number;                 
  employerId: number; 
  categoryId: number;       
  title: string;
  description: string;
  location: string;
  remote: boolean;
  salaryMin?: number;         
  salaryMax?: number;         
  currency?: string;
  status: 'OPEN' | 'CLOSED' | 'DRAFT'; 
  createdAt: Date;
  updatedAt: Date;
}