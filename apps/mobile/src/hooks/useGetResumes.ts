import { useQuery } from '@tanstack/react-query';
import { useGetCandidateProfile } from './useGetCandidateProfile';

export function useGetResumes() {
  const { data, ...rest } = useGetCandidateProfile();
  return { data: data?.resumes ?? [], ...rest };
}
