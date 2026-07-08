import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { GeoapifyProvider } from './providers/geoapify.provider';

@Module({
  controllers: [LocationController],
  providers: [
    LocationService,
    GeoapifyProvider,
    {
      provide: 'GEOCODING_PROVIDER',
      useFactory: (geoapify: GeoapifyProvider) => {
        const provider = process.env.LOCATION_PROVIDER || 'geoapify';
        if (provider === 'geoapify') {
          return geoapify;
        }
        // In the future, we can add other providers here:
        // if (provider === 'google') return googleProvider;
        return geoapify;
      },
      inject: [GeoapifyProvider],
    },
  ],
  exports: [LocationService],
})
export class LocationModule {}
