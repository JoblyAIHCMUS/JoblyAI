import { SearchDocument } from './search-document.model.js';

export interface SearchProvider {
  search(queries: string[]): Promise<SearchDocument[]>;
}