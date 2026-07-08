import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import { CreateLocationDto } from './dto/create-location.dto';
import type { GeocodingProvider } from './interfaces/geocoding-provider.interface';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    @Inject('GEOCODING_PROVIDER')
    private readonly geocodingProvider: GeocodingProvider
  ) {}

  async autocomplete(text: string) {
    return this.geocodingProvider.autocomplete(text);
  }

  async getOrCreateLocation(dto: CreateLocationDto) {
    try {
      const existing = await this.prisma.location.findUnique({
        where: {
          provider_providerId: {
            provider: dto.provider,
            providerId: dto.providerId,
          },
        },
      });

      if (existing) {
        return existing;
      }

      return await this.prisma.location.create({
        data: {
          provider: dto.provider,
          providerId: dto.providerId,
          formattedAddress: dto.formattedAddress,
          lat: dto.lat,
          lng: dto.lng,
          city: dto.city || null,
          state: dto.state || null,
          country: dto.country || null,
          postcode: dto.postcode || null,
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Error in getOrCreateLocation: ${error.message as string}`
      );
      throw error;
    }
  }
}
