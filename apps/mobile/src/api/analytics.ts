import { apiClient } from './config';
import { JobViewAnalytics, JobApplicationAnalytics } from '../types/analytics';

export async function getJobViewsAnalytics(startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<JobViewAnalytics[]> {
  const params = {
    startDate: startDate?.toISOString().split('T')[0],
    endDate: endDate?.toISOString().split('T')[0],
    groupBy
  };
  const response = await apiClient.get<JobViewAnalytics[]>('/jobs/analytics/views', { params });
  return response.data;
}

export async function getJobApplicationsAnalytics(startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<JobApplicationAnalytics[]> {
  const params = {
    startDate: startDate?.toISOString().split('T')[0],
    endDate: endDate?.toISOString().split('T')[0],
    groupBy
  };
  const response = await apiClient.get<JobApplicationAnalytics[]>('/jobs/analytics/applications', { params });
  return response.data;
}
