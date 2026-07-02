export interface PublicQuestion {
  question: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevance: string;
  confidence: number;
  sources: {
    title: string;
    url: string;
  }[];
}