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
