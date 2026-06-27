'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Target,
  Rocket,
} from 'lucide-react';
import { useInterviewPrep } from '@/api-hook/ai/use-interview-prep';
import { InterviewPrepStatus } from '@/services/interviewPrepService';

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

  const renderQuestions = (questions: any[]) => {
    if (!questions || questions.length === 0)
      return (
        <p className="text-muted-foreground text-center py-8">
          No questions generated for this level.
        </p>
      );

    return (
      <Accordion type="single" collapsible className="w-full">
        {questions.map((q, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-semibold">
              {q.question}
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Lightbulb className="h-4 w-4" />
                  <span>Suggested Answer</span>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-6">
                  {q.sampleAnswer}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-orange-500 font-medium">
                    <Target className="h-4 w-4" />
                    <span>Interviewer Intent</span>
                  </div>
                  <p className="text-muted-foreground text-sm pl-6">
                    {q.interviewerIntent}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-500 font-medium">
                    <Rocket className="h-4 w-4" />
                    <span>Preparation Tips</span>
                  </div>
                  <p className="text-muted-foreground text-sm pl-6">{q.tips}</p>
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
            <Tabs defaultValue="easy" className="w-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="easy" className="gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-600 border-green-200"
                  >
                    Easy
                  </Badge>
                  Behavioral
                </TabsTrigger>
                <TabsTrigger value="medium" className="gap-2">
                  <Badge
                    variant="outline"
                    className="bg-orange-500/10 text-orange-600 border-orange-200"
                  >
                    Medium
                  </Badge>
                  Situational
                </TabsTrigger>
                <TabsTrigger value="hard" className="gap-2">
                  <Badge
                    variant="outline"
                    className="bg-red-500/10 text-red-600 border-red-200"
                  >
                    Hard
                  </Badge>
                  Strategic
                </TabsTrigger>
              </TabsList>

              <TabsContent value="easy" className="mt-0">
                {renderQuestions(data.questions?.easy || [])}
              </TabsContent>
              <TabsContent value="medium" className="mt-0">
                {renderQuestions(data.questions?.medium || [])}
              </TabsContent>
              <TabsContent value="hard" className="mt-0">
                {renderQuestions(data.questions?.hard || [])}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
