import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { SearchLocationsDto } from './dto/search-locations.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('search')
  async searchLocations(@Query() searchLocationsDto: SearchLocationsDto) {
    return this.locationsService.search(searchLocationsDto.q);
  }
}
