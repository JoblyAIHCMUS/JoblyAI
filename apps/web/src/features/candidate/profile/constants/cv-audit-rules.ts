export interface RuleReference {
  key: string;
  label: string;
  url: string;
  summary: string;
  fullDescription: string;
}

export const CV_AUDIT_RULES: Record<string, RuleReference> = {
  google_xyz: {
    key: 'google_xyz',
    label: 'Google Resume Writing Guide',
    url: 'https://www.youtube.com/watch?v=BYUy1yvjHxE&feature=emb_title',
    summary:
      'Google XYZ formula requires achievements to be framed as: Accomplished [X] as measured by [Y] by doing [Z].',
    fullDescription:
      'Developed by Google recruiting teams, this rule states that every achievement should focus on concrete deliverables and business measurements rather than just describing responsibilities. It ensures your value is quantified.',
  },
  harvard_verbs: {
    key: 'harvard_verbs',
    label: 'Harvard HBS Career Guide',
    url: 'https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/',
    summary:
      'Harvard standards mandate starting each experience statement with a strong Action Verb and avoiding passive language or clichés.',
    fullDescription:
      'Published by the Harvard Business School Office of Career Development. It strictly mandates starting resume experience statements with powerful action verbs in the active voice (e.g., Optimized, Engineered, Spearheaded) instead of passive phrasing like "responsible for" or "assisted with", which dilute your personal contribution.',
  },
};
