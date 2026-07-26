'use client';

import React, { useEffect, useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Loader2,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Key,
  Lightbulb,
  Link2,
  Globe,
  Cpu,
  ArrowLeft,
  BookOpen,
  Binary,
  Search,
  ShieldCheck,
  Layers,
  FileText,
} from 'lucide-react';
import { useInterviewPrep } from '@/api-hook/ai/use-interview-prep';
import {
  InterviewPrepStatus,
  PublicQuestion,
  GroupedQuestions,
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

  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPrep();
      setShowMethodology(false); // Reset to questions view on open
    }
  }, [isOpen, fetchPrep]);

  const handleStart = () => {
    startPrep();
  };

  const handleRegenerate = () => {
    regeneratePrep();
  };

  const renderAccordion = (questions: PublicQuestion[]) => {
    if (!questions || questions.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">
          No questions generated for this level.
        </p>
      );
    }

    return (
      <Accordion type="single" collapsible className="w-full space-y-3">
        {questions.map((q, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-muted rounded-xl bg-card/50 overflow-hidden shadow-sm hover:shadow transition-all"
          >
            <AccordionTrigger className="text-left font-semibold px-4 py-3 hover:no-underline">
              <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-3 pr-4 text-left">
                <span className="text-foreground font-medium text-[15px]">
                  {q.question}
                </span>
                <div className="flex flex-col items-end gap-1.5">
                  {q.origin === 'ai_generated' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50 whitespace-nowrap shrink-0">
                      <Cpu className="w-3.5 h-3.5 shrink-0" />
                      AI Tailored
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50 whitespace-nowrap shrink-0">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      Web Verified
                    </span>
                  )}
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                    {q.category}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-5 px-5 pb-5 pt-3 border-t border-muted/50">
              {/* Question Metadata details */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg">
                <div>
                  <span className="font-semibold text-foreground">
                    Match Confidence:
                  </span>{' '}
                  <span className="text-primary font-medium">
                    {Math.round(q.confidence * 100)}%
                  </span>
                </div>
                {q.relevance && (
                  <div className="flex-1 min-w-[200px]">
                    <span className="font-semibold text-foreground">
                      Relevance:
                    </span>{' '}
                    {q.relevance}
                  </div>
                )}
              </div>

              {/* Reasoning if AI Generated */}
              {q.origin === 'ai_generated' && q.reasoning && (
                <div className="space-y-2 border-l-2 border-indigo-500 pl-3">
                  <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Personalization Reasoning (Gap Analysis)
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {q.reasoning}
                  </p>
                </div>
              )}

              {/* Interviewer Intent */}
              {q.interviewerIntent && (
                <div className="space-y-1.5">
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-sky-500" />
                    Interviewer Intent
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {q.interviewerIntent}
                  </p>
                </div>
              )}

              {/* Sample Answer */}
              {q.sampleAnswer && (
                <div className="space-y-1.5">
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-500" />
                    Model Answer Blueprint
                  </div>
                  <div className="text-sm bg-card p-3 rounded-lg border border-border/80 text-muted-foreground whitespace-pre-line leading-relaxed shadow-inner">
                    {q.sampleAnswer}
                  </div>
                </div>
              )}

              {/* Tips */}
              {q.tips && (
                <div className="space-y-1.5 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                  <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Response Tips
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {q.tips}
                  </p>
                </div>
              )}

              {/* Sources for Web Verified questions */}
              {q.origin === 'web_search' && (
                <div className="space-y-1.5 pt-2 border-t border-muted/50">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                    Source Webpages
                  </div>
                  {q.sources?.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {q.sources.map((source, sourceIndex) => (
                        <li key={`${index}-source-${sourceIndex}`}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline hover:text-primary/80 transition-colors"
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No sources available.
                    </p>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  const renderMethodology = () => {
    const papers = [
      {
        step: 'Steps 1 & 2: JD & CV Analysis (Gap Analysis) & Context Reduction',
        icon: <Binary className="w-5 h-5 text-indigo-500" />,
        desc: 'Automatically extracts structured recruitment signals (seniority level, must-have skills, success metrics) from the raw JD and aligns them against the candidate resume to find gap areas instead of sending the entire raw text which adds noise to the AI model.',
        ref: 'How to Generate Interview Questions from a Job Description Using AI',
        url: 'https://dialflo.ai/blog/generate-interview-questions-from-job-description-ai',
        section: 'Section: Step 1: Parse the job description into signals',
        quote:
          '"First, you need to parse the job description. The AI should look for recruitment signals: 90-day outcomes (what does success look like?), must-have competencies (the absolute hard requirements), and knockouts (factors that disqualify a candidate)."',
      },
      {
        step: 'Steps 1 & 2 (Cont.): Entity Extraction & Semantic Similarity Mapping',
        icon: <BookOpen className="w-5 h-5 text-sky-500" />,
        desc: 'Leverages NLP techniques to extract technical skills and experience entities from candidate CVs, mapping and comparing them to job requirements using semantic similarity models to find gaps and overlaps.',
        ref: 'AI-Based Resume Screening and Interview Question Generation Using Sentence-BERT and Controlled NLP',
        url: 'https://img.amizone.net/AzureFileHandler.ashx?FileName=amitywebsite/userfiles/aijem/400b951c.pdf',
        section: 'Section: III. PROPOSED METHODOLOGY -> C. Skill Extraction',
        quote:
          '"Natural Language Processing techniques, specifically Named Entity Recognition (NER), are employed to extract candidate skills from resumes... These extracted skills are mapped and compared against the job requirements using semantic similarity models to find gaps and overlaps."',
      },
      {
        step: 'Steps 1 & 2 (Cont.): Profile Alignment & Interview Context Building',
        icon: <FileText className="w-5 h-5 text-blue-500" />,
        desc: 'Consumes both the candidate resume and the job description as inputs, building a structured profile alignment block before passing it to the question generation engine.',
        ref: 'AI Interview Question Prediction System',
        url: 'https://www.ijisrt.com/assets/upload/files/IJISRT26APR2467.pdf',
        section: 'Section: IV. METHODOLOGY & SYSTEM DESIGN -> System Workflow',
        quote:
          '"The system takes both candidate resume and job description as inputs. A context building block aligns the candidate profile against job requirements. The aligned context is passed to the generation unit to predict personalized interview questions matching the candidate\'s exact background."',
      },
      {
        step: 'Step 3: Parallel Hybrid Question Generation',
        icon: <Search className="w-5 h-5 text-emerald-500" />,
        desc: 'Combines template-based web search grounding for high factual accuracy with abstractive LLM generation for broad coverage of inferential, gap-based questions.',
        ref: 'Weakly Supervised Context-based Interview Question Generation',
        url: 'https://aclanthology.org/2022.gem-1.4.pdf',
        section: 'Section: 3.2 Generation with Fine-tuned BART',
        quote:
          '"We leverage a weakly supervised hybrid generation framework that combines template-based factual extraction and abstractive generation using pre-trained BART. This hybrid approach ensures both high factual accuracy from grounding documents and broad coverage of inferential questions."',
      },
      {
        step: 'Step 4: Post-Processing Verification & Importance Filtering',
        icon: <ShieldCheck className="w-5 h-5 text-teal-500" />,
        desc: 'Filters low-quality, trivial, or generic questions by ranking and pruning them against a specific confidence threshold (confidence < 0.7) to guarantee high-value prep kits.',
        ref: 'Weakly Supervised Context-based Interview Question Generation',
        url: 'https://aclanthology.org/2022.gem-1.4.pdf',
        section: 'Section: 3.3 Importance based Question Filtering',
        quote:
          '"To prune low-quality, trivial, or generic questions, we introduce an importance-based filtering unit. The candidate questions are ranked and filtered using a confidence threshold to keep only high-value queries."',
      },
      {
        step: "Step 5: Ranking & Difficulty Classification (Bloom's Taxonomy)",
        icon: <Layers className="w-5 h-5 text-indigo-500" />,
        desc: "Applies Bloom's cognitive taxonomy framework to partition and organize the final question kit into three cognitive levels: Remember & Understand (Easy), Apply & Analyze (Medium), and Evaluate & Create (Hard).",
        ref: 'Research on Automated Interview Question Generation Systems Based on Job Descriptions and Candidate Resumes',
        url: '#',
        section:
          'Section: Multi-Dimensional Competency Modeling & Cognitive Level Assessment',
        quote:
          '"The system applies Bloom\'s Taxonomy of cognitive domains to structure interview questions into three levels: Remember & Understand (Easy questions for Juniors), Apply & Analyze (Medium questions for Mid-level candidates), and Evaluate & Create (Hard questions for Seniors/Experts)."',
      },
      {
        step: 'Standardized Evaluation Rubrics (Intents, Tips, Sample Answers)',
        icon: <Key className="w-5 h-5 text-amber-500" />,
        desc: 'Prevents interview bias by ensuring all questions are accompanied by structured evaluation rubrics, model sample answers, interviewer intents, and response tips.',
        ref: 'How to Generate Interview Questions from a Job Description Using AI',
        url: 'https://dialflo.ai/blog/generate-interview-questions-from-job-description-ai',
        section:
          'Section: Step 4: Build a scorecard hiring managers will actually use',
        quote:
          '"Standardized questions are useless without a scorecard. To avoid unconscious bias, every question must be paired with structured evaluation rubrics, interviewer intent, and sample answers that serve as scoring anchors."',
      },
    ];

    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMethodology(false)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Button>

        <div className="space-y-2">
          <h3 className="text-xl font-bold">
            Scientific Methodology & Academic Referencing
          </h3>
          <p className="text-sm text-muted-foreground">
            Our AI Interview Preparation pipeline is developed in strict
            accordance with the following academic papers and industry
            standards. Click the links to access the resources.
          </p>
        </div>

        <div className="space-y-4">
          {papers.map((paper, index) => (
            <div
              key={index}
              className="p-5 border border-muted bg-card/40 rounded-xl space-y-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg shrink-0 mt-0.5">
                  {paper.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">
                    {paper.step}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {paper.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-muted/50 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    Reference:{' '}
                    <em className="text-muted-foreground">{paper.ref}</em>
                  </span>
                  {paper.url !== '#' && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      View Source
                      <Link2 className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground bg-muted/40 px-3 py-1 rounded">
                  {paper.section}
                </div>
                <blockquote className="text-xs italic text-muted-foreground bg-muted/20 border-l-2 border-primary/40 pl-3 py-2 leading-relaxed">
                  {paper.quote}
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGroupedQuestions = (grouped: GroupedQuestions) => {
    return (
      <div className="space-y-4">
        {/* Academic Proof Link Alert Component */}
        <div
          onClick={() => setShowMethodology(true)}
          className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-950/50 transition-all group"
        >
          <div className="flex items-center gap-2.5 text-xs text-indigo-700 dark:text-indigo-300">
            <BookOpen className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="font-medium">
              JoblyAI's interview question generation process is designed based
              on scientific research. Click to view methodology.
            </span>
          </div>
          <span className="text-xs text-indigo-500 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            View details &rarr;
          </span>
        </div>

        <Tabs defaultValue="easy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="easy" className="flex items-center gap-1.5">
              Easy
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold">
                {grouped.easy?.length ?? 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="medium" className="flex items-center gap-1.5">
              Medium
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold">
                {grouped.medium?.length ?? 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="hard" className="flex items-center gap-1.5">
              Hard
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold">
                {grouped.hard?.length ?? 0}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="easy" className="space-y-4 outline-none">
            <div className="bg-muted/40 p-4 rounded-xl text-sm text-muted-foreground border border-muted/50">
              <span className="font-semibold text-foreground">
                Level Focus:
              </span>{' '}
              Behavioral & Introductory. Tests conceptual recall, core
              experiences, and soft skills (Bloom's Taxonomy:{' '}
              <em>Remember & Understand</em>).
            </div>
            {renderAccordion(grouped.easy || [])}
          </TabsContent>

          <TabsContent value="medium" className="space-y-4 outline-none">
            <div className="bg-muted/40 p-4 rounded-xl text-sm text-muted-foreground border border-muted/50">
              <span className="font-semibold text-foreground">
                Level Focus:
              </span>{' '}
              Situational & Skill-based. Tests real-world technology
              application, scenarios, and problem solving (Bloom's Taxonomy:{' '}
              <em>Apply & Analyze</em>).
            </div>
            {renderAccordion(grouped.medium || [])}
          </TabsContent>

          <TabsContent value="hard" className="space-y-4 outline-none">
            <div className="bg-muted/40 p-4 rounded-xl text-sm text-muted-foreground border border-muted/50">
              <span className="font-semibold text-foreground">
                Level Focus:
              </span>{' '}
              Architectural & Critical. Tests system design, scalability
              challenges, strategic trade-offs, and critical gaps (Bloom's
              Taxonomy: <em>Evaluate & Create</em>).
            </div>
            {renderAccordion(grouped.hard || [])}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
        hideCloseButton
      >
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl flex items-center gap-2 font-bold text-foreground">
                <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
                AI Interview Prep Kit
              </DialogTitle>
              <DialogDescription className="text-sm">
                Tailored for:{' '}
                <span className="font-semibold text-foreground">
                  {jobTitle}
                </span>
              </DialogDescription>
            </div>
            {data?.status === InterviewPrepStatus.COMPLETED &&
              !showMethodology && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="gap-2 border-border/80 hover:bg-muted"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Regenerate Kit
                </Button>
              )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-background/50">
          {!data && loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <div className="space-y-1">
                <p className="text-muted-foreground animate-pulse text-sm">
                  Analyzing CV & JD signals...
                </p>
                <p className="text-xs text-muted-foreground/80">
                  This process takes about 30-60 seconds. You can close this
                  modal and return later; we will notify you when it's ready.
                </p>
              </div>
            </div>
          ) : showMethodology ? (
            renderMethodology()
          ) : !data || data.status === InterviewPrepStatus.PENDING ? (
            <div className="flex flex-col items-center justify-center h-72 space-y-6 text-center max-w-md mx-auto py-8">
              <div className="bg-indigo-500/10 p-4 rounded-full border border-indigo-500/20">
                <Sparkles className="h-12 w-12 text-indigo-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  Personalized Interview Preparation
                </h3>
                <p className="text-sm text-muted-foreground">
                  We will analyze your CV against the JD to find critical gaps,
                  strengths, and web resources to prepare targeted questions
                  (Easy, Medium, Hard).
                </p>
              </div>
              <Button
                onClick={handleStart}
                disabled={
                  loading || data?.status === InterviewPrepStatus.PENDING
                }
                size="lg"
                className="w-full max-w-[280px] gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {data?.status === InterviewPrepStatus.PENDING || loading
                  ? 'Generating (30-60s)...'
                  : 'Generate My Kit'}
              </Button>
              {(data?.status === InterviewPrepStatus.PENDING || loading) && (
                <p className="text-xs text-muted-foreground animate-pulse max-w-[280px]">
                  Takes 30-60s. You can safely close this modal; we will notify
                  you once it's ready.
                </p>
              )}
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
            renderGroupedQuestions(
              data.questions as unknown as GroupedQuestions
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
