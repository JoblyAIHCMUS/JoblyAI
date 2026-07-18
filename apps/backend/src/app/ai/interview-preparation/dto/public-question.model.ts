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
  sampleAnswer: string;
  interviewerIntent: string;
  tips: string;
  origin: 'web_search' | 'ai_generated';
  /** Only present for ai_generated questions — explains why this question was generated based on gap analysis */
  reasoning?: string;
}

export interface GroupedQuestions {
  easy: PublicQuestion[];
  medium: PublicQuestion[];
  hard: PublicQuestion[];
}
