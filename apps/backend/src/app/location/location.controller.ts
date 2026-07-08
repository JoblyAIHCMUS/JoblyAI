import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationService } from './location.service';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete address search' })
  @ApiQuery({
    name: 'text',
    type: String,
    required: true,
    description: 'Address text search query',
  })
  @ApiResponse({ status: 200, description: 'List of matching address results' })
  async autocomplete(@Query('text') text: string) {
    return this.locationService.autocomplete(text || '');
  }

  @Post()
  @ApiOperation({ summary: 'Get or create structured location' })
  @ApiResponse({
    status: 201,
    description: 'Structured location object from database',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrCreateLocation(@Body() dto: CreateLocationDto) {
    return this.locationService.getOrCreateLocation(dto);
  }
}
