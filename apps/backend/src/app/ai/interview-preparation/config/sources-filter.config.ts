export interface SourcesFilterConfig {
  /**
   * Allowed domains/websites for interview question sources.
   * When populated, Gemini is instructed to search only within these domains,
   * and extracted sources are validated to match these domains.
   */
  whitelist: string[];

  /**
   * Disallowed/blocked domains or keywords.
   * Gemini is instructed to strictly avoid these domains,
   * and extracted sources matching any blacklist domain will be discarded.
   */
  blacklist: string[];
}

export const DEFAULT_SOURCES_FILTER_CONFIG: SourcesFilterConfig = {
  whitelist: [
    // Multi-Industry Career & Real Interview Review Platforms (Global - All Fields)
    'glassdoor.com',
    'indeed.com',
    'linkedin.com',
    'themuse.com',
    'ambitionbox.com',
    'levels.fyi',
    'comparably.com',

    // Global Standards for HR, Management, Business & Leadership (All Industries)
    'shrm.org', // Society for Human Resource Management (Global HR Standard)
    'hbr.org', // Harvard Business Review (Leadership & Management)
    'forbes.com', // Business, Finance, Sales & Executive guides
    'vault.com', // Firsthand / Vault (Consulting, Finance, Law, Business)

    // Engineering & Technology Platforms (Specialized IT/Tech)
    'leetcode.com',
    'geeksforgeeks.org',
    'github.com',
    'hackerrank.com',
  ],
  blacklist: [
    'chegg.com',
    'scribd.com',
    'coursehero.com',
    'quora.com',
    'brainly.com',
  ],
};

