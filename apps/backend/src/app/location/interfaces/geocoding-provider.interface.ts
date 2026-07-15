import { GeocodingResult } from './geocoding-result.interface';

export interface GeocodingProvider {
  autocomplete(text: string): Promise<GeocodingResult[]>;
}
