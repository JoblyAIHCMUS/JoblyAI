import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NominatimLocation , LocationSuggestion } from './locations.interface';

@Injectable()
export class LocationsService {
  constructor(private readonly httpService: HttpService) {}

  async search(query: string): Promise<LocationSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const url = 'https://nominatim.openstreetmap.org/search';

    try {
      const response = await firstValueFrom(
        this.httpService.get<NominatimLocation[]>(url, {
          headers: {
            'User-Agent': 'JoblyAI/1.0 (https://jobly.com)',
          },
          params: {
            q: query.trim(),
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
        }),
      );

      return response.data.map((item) => ({
        displayName: item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        city:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          null,
        state: item.address?.state || null,
        country: item.address?.country || null,
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }
}