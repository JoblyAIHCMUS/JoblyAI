import { apiClient } from './config';
import type { LocationDetail } from '../types/location';

export interface ApiOptions {
  signal?: AbortSignal;
}

export async function getLocationAutocomplete(
  text: string,
  options?: ApiOptions
): Promise<LocationDetail[]> {
  if (!text || text.trim() === '') return [];
  const response = await apiClient.get<LocationDetail[]>(
    '/location/autocomplete',
    {
      params: { text },
      signal: options?.signal,
    }
  );
  return response.data;
}

export async function getOrCreateLocation(
  location: Omit<LocationDetail, 'id'>,
  options?: ApiOptions
): Promise<LocationDetail> {
  const response = await apiClient.post<LocationDetail>('/location', location, {
    signal: options?.signal,
  });
  return response.data;
}
