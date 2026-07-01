import { Injectable } from '@nestjs/common';
import { SearchProvider } from './search-provider.interface.js';
import { SearchDocument } from './search-document.model.js';

@Injectable()
export class MockSearchProvider implements SearchProvider {
  async search(queries: string[]): Promise<SearchDocument[]> {
    void queries;
    return [];
  }
}