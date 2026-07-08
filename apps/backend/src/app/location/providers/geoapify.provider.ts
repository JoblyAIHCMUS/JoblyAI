import { Injectable, Logger } from '@nestjs/common';
import { GeocodingProvider } from '../interfaces/geocoding-provider.interface';
import { GeocodingResult } from '../interfaces/geocoding-result.interface';

@Injectable()
export class GeoapifyProvider implements GeocodingProvider {
  private readonly logger = new Logger(GeoapifyProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.geoapify.com/v1/geocode/autocomplete';

  constructor() {
    this.apiKey = process.env.GEOAPIFY_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn(
        'GEOAPIFY_API_KEY is not defined in the environment variables.'
      );
    }
  }

  async autocomplete(text: string): Promise<GeocodingResult[]> {
    if (!text || text.trim() === '') {
      return [];
    }

    if (!this.apiKey) {
      this.logger.error('Cannot query Geoapify: API key is missing.');
      return [];
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append('text', text);
      url.searchParams.append('apiKey', this.apiKey);
      url.searchParams.append('limit', '5');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(
          `Geoapify autocomplete request failed: ${response.statusText}`
        );
      }

      const data = (await response.json()) as {
        type: string;
        features: Array<{
          type: string;
          properties?: {
            place_id?: string;
            formatted?: string;
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            region?: string;
            country?: string;
            postcode?: string;
            lon?: number;
            lat?: number;
          };
          geometry?: {
            type: string;
            coordinates: [number, number];
          };
        }>;
      };

      if (!data || !data.features) {
        return [];
      }

      return data.features.map((feature) => {
        const props = feature.properties || {};
        const coordinates = feature.geometry?.coordinates || [0, 0]; // [lon, lat] in GeoJSON

        return {
          provider: 'geoapify',
          providerId:
            props.place_id || `geoapify_${Date.now()}_${Math.random()}`,
          formattedAddress: props.formatted || text,
          lat: props.lat ?? coordinates[1] ?? 0.0,
          lng: props.lon ?? coordinates[0] ?? 0.0,
          city: props.city || props.town || props.village || undefined,
          state: props.state || props.region || undefined,
          country: props.country || undefined,
          postcode: props.postcode || undefined,
        };
      });
    } catch (error: any) {
      this.logger.error(
        `Error fetching autocomplete suggestions from Geoapify: ${
          error.message as string
        }`
      );
      return [];
    }
  }
}
