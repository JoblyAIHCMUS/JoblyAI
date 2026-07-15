import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LocationDetail {
  id?: string;
  provider: string;
  providerId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postcode?: string | null;
}

/**
 * Autocomplete address suggestions from provider
 */
export async function getLocationAutocomplete(
  text: string
): Promise<LocationDetail[]> {
  if (!text || text.trim() === '') return [];
  const response = await axios.get<LocationDetail[]>(
    `${API_BASE_URL}/api/location/autocomplete`,
    {
      params: { text },
      withCredentials: true,
    }
  );
  return response.data;
}

/**
 * Resolve/save a location to database
 */
export async function getOrCreateLocation(
  location: Omit<LocationDetail, 'id'>
): Promise<LocationDetail> {
  const response = await axios.post<LocationDetail>(
    `${API_BASE_URL}/api/location`,
    location,
    {
      withCredentials: true,
    }
  );
  return response.data;
}
