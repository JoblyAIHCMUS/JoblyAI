export 
interface NominatimLocation {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export interface LocationSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  country: string | null;
}