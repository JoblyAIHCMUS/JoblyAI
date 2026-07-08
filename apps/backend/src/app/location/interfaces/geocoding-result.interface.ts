export interface GeocodingResult {
  provider: string;
  providerId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}
