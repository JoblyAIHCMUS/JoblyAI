'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CandidateResume } from '@/types/candidate';

export interface ProcessingTask {
  parsing: boolean;
  scoring: boolean;
  parsingStartTime?: number;
  scoringStartTime?: number;
}

export type ProcessingTasks = Record<number, ProcessingTask>;

type Action =
  | { type: 'SET_TASKS'; payload: ProcessingTasks }
  | { type: 'START_PARSING'; payload: number }
  | { type: 'START_SCORING'; payload: number }
  | { type: 'FINISH_PARSING'; payload: number }
  | { type: 'FINISH_SCORING'; payload: number }
  | { type: 'CLEAR_TASK'; payload: number }
  | { type: 'RECONCILE'; payload: { resumes: CandidateResume[]; now: number } };

const STORAGE_KEY = 'jobly_ai_processing_tasks';

const initialState: ProcessingTasks = {};

function reducer(state: ProcessingTasks, action: Action): ProcessingTasks {
  const next = { ...state };
  const now = Date.now();
  const GRACE_PERIOD = 30000;
  const TIMEOUT_PERIOD = 300000;

  switch (action.type) {
    case 'SET_TASKS':
      return action.payload;

    case 'START_PARSING': {
      next[action.payload] = {
        ...next[action.payload],
        parsing: true,
        parsingStartTime: now,
      };
      break;
    }

    case 'START_SCORING': {
      next[action.payload] = {
        ...next[action.payload],
        scoring: true,
        scoringStartTime: now,
      };
      break;
    }

    case 'FINISH_PARSING': {
      if (next[action.payload]) next[action.payload].parsing = false;
      break;
    }

    case 'FINISH_SCORING': {
      if (next[action.payload]) next[action.payload].scoring = false;
      break;
    }

    case 'CLEAR_TASK': {
      delete next[action.payload];
      break;
    }

    case 'RECONCILE': {
      const { resumes } = action.payload;
      const resumeIds = new Set(resumes.map((r) => r.id));

      Object.keys(next).forEach((idStr) => {
        const id = Number(idStr);
        const task = next[id];
        if (!task) return;

        const resume = resumes.find((r) => r.id === id);

        if (!resumeIds.has(id)) {
          const startTime = Math.min(
            task.parsingStartTime || now,
            task.scoringStartTime || now
          );
          if (now - startTime > 15000) {
            delete next[id];
            return;
          }
        }

        if (resume) {
          if (
            resume.parsedText &&
            task.parsing &&
            (!task.parsingStartTime ||
              now - task.parsingStartTime > GRACE_PERIOD)
          ) {
            task.parsing = false;
          }
          if (
            resume.aiScore !== null &&
            task.scoring &&
            (!task.scoringStartTime ||
              now - task.scoringStartTime > GRACE_PERIOD)
          ) {
            task.scoring = false;
          }
        }

        const startTime = Math.min(
          task.parsingStartTime || now,
          task.scoringStartTime || now
        );
        if (now - startTime > TIMEOUT_PERIOD) {
          delete next[id];
          return;
        }

        if (!task.parsing && !task.scoring) {
          delete next[id];
        }
      });
      break;
    }
  }

  return next;
}

interface AiProcessingContextValue {
  processingTasks: ProcessingTasks;
  triggerParse: (resumeId: number) => void;
  triggerScore: (resumeId: number) => void;
  onParsedSuccess: (resumeId: number) => void;
  onScoredSuccess: (resumeId: number) => void;
  reconcile: (resumes: CandidateResume[]) => void;
}

const AiProcessingContext = createContext<AiProcessingContextValue | null>(
  null
);

export function AiProcessingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    () => initialState
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const rehydrated: ProcessingTasks = {};
          Object.keys(parsed).forEach((key) => {
            rehydrated[Number(key)] = parsed[key];
          });
          dispatch({ type: 'SET_TASKS', payload: rehydrated });
        } catch (e) {
          console.error('Failed to parse AI tasks:', e);
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const triggerParse = useCallback(
    (resumeId: number) =>
      dispatch({ type: 'START_PARSING', payload: resumeId }),
    []
  );
  const triggerScore = useCallback(
    (resumeId: number) =>
      dispatch({ type: 'START_SCORING', payload: resumeId }),
    []
  );
  const onParsedSuccess = useCallback(
    (resumeId: number) =>
      dispatch({ type: 'FINISH_PARSING', payload: resumeId }),
    []
  );
  const onScoredSuccess = useCallback(
    (resumeId: number) =>
      dispatch({ type: 'FINISH_SCORING', payload: resumeId }),
    []
  );
  const reconcile = useCallback(
    (resumes: CandidateResume[]) =>
      dispatch({ type: 'RECONCILE', payload: { resumes, now: Date.now() } }),
    []
  );

  const value = useMemo(
    () => ({
      processingTasks: state,
      triggerParse,
      triggerScore,
      onParsedSuccess,
      onScoredSuccess,
      reconcile,
    }),
    [
      state,
      triggerParse,
      triggerScore,
      onParsedSuccess,
      onScoredSuccess,
      reconcile,
    ]
  );

  return (
    <AiProcessingContext.Provider value={value}>
      {children}
    </AiProcessingContext.Provider>
  );
}

export function useAiProcessing() {
  const ctx = useContext(AiProcessingContext);
  if (!ctx)
    throw new Error('useAiProcessing must be used within AiProcessingProvider');
  return ctx;
}
