'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useInterviewPrep } from '@/api-hook/ai/use-interview-prep';
import {
  InterviewPrepStatus,
  InterviewPrepQuestion,
} from '@/services/interviewPrepService';

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
}) => {
  const { data, loading, fetchPrep, startPrep, regeneratePrep } =
    useInterviewPrep(jobId);

  useEffect(() => {
    if (isOpen) {
      fetchPrep();
    }
  }, [isOpen, fetchPrep]);

  const handleStart = () => {
    startPrep();
  };

  const handleRegenerate = () => {
    regeneratePrep();
  };

  const renderQuestions = (questions: InterviewPrepQuestion[]) => {
    if (!questions || questions.length === 0)
      return (
        <p className="text-muted-foreground text-center py-8">
          No questions generated yet.
        </p>
      );

    return (
      <Accordion type="single" collapsible className="w-full">
        {questions.map((q, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-semibold">
              <div className="flex w-full flex-col items-start gap-2 pr-4 text-left">
                <span>{q.question}</span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Found in {q.evidenceCount} source
                    {q.evidenceCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Sources
                  </div>
                  {q.sources?.length ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {q.sources.map((source: string, sourceIndex: number) => (
                        <li key={`${index}-source-${sourceIndex}`}>{source}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No sources available.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Supporting Contexts
                  </div>
                  {q.contexts?.length ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {q.contexts.map((context: string, contextIndex: number) => (
                        <li key={`${index}-context-${contextIndex}`}>
                          {context}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No supporting contexts available.
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Interview Prep Kit
              </DialogTitle>
              <DialogDescription>
                Tailored for:{' '}
                <span className="font-semibold text-foreground">
                  {jobTitle}
                </span>
              </DialogDescription>
            </div>
            {data?.status === InterviewPrepStatus.COMPLETED && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
          {!data && loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">
                Loading preparation kit...
              </p>
            </div>
          ) : !data || data.status === InterviewPrepStatus.PENDING ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-6 text-center max-w-md mx-auto">
              <div className="bg-primary/10 p-4 rounded-full">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  Ready to ace your interview?
                </h3>
                <p className="text-muted-foreground">
                  Our AI will analyze your specific resume and the job
                  description to generate 9 tailored questions just for you.
                </p>
              </div>
              <Button
                onClick={handleStart}
                disabled={loading}
                size="lg"
                className="w-full gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {data?.status === InterviewPrepStatus.PENDING
                  ? 'Generating...'
                  : 'Generate My Kit'}
              </Button>
            </div>
          ) : data.status === InterviewPrepStatus.FAILED ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <p className="text-destructive font-medium">
                Failed to generate interview prep kit.
              </p>
              <Button onClick={handleStart} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            renderQuestions(data.questions || [])
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
