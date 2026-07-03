export interface SearchDocument {
  id?: string;
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}
