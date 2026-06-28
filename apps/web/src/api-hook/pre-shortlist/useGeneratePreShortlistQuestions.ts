// apps/web/src/api-hook/pre-shortlist/useGeneratePreShortlistQuestions.ts

'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  generatePreShortlistQuestions,
  type GenerateQuestionsRequest,
  type GenerateQuestionsResponse,
} from '@/api-client/pre-shortlist';

export function useGeneratePreShortlistQuestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<GenerateQuestionsResponse | null>(null);

  const generate = useCallback(async (input: GenerateQuestionsRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generatePreShortlistQuestions(input);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      toast.error('Could not generate questions. Please try again or write them manually.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error, data };
}
