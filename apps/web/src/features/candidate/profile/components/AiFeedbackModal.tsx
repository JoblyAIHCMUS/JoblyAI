'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layout,
  Target,
} from 'lucide-react';

interface AiFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number | null;
  feedback:
    | {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        formatting: string;
        impact: string;
      }
    | any;
}

export function AiFeedbackModal({
  isOpen,
  onClose,
  score,
  feedback,
}: AiFeedbackModalProps) {
  const displayScore = score !== null ? Math.round(score * 100) : null;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (s >= 50) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-accent-primary w-5 h-5" />
            <DialogTitle className="text-xl font-['Lexend_Deca']">
              AI Resume Analysis
            </DialogTitle>
          </div>
          <DialogDescription>
            Strategic evaluation based on 2026 recruitment standards.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6 pb-6">
            {/* Score Section */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1 font-['Lexend_Deca']">
                Overall Strategic Score
              </div>
              <div
                className={`text-5xl font-bold font-['Lexend_Deca'] ${
                  displayScore
                    ? getScoreColor(displayScore).split(' ')[0]
                    : 'text-slate-400'
                }`}
              >
                {displayScore ?? '--'}
                <span className="text-2xl ml-1 text-slate-400">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="space-y-3 p-4 border rounded-xl bg-green-50/30 border-green-100">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle2 size={18} />
                  <span>Strategic Strengths</span>
                </div>
                <ul className="text-sm space-y-2 text-slate-600">
                  {feedback?.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-500">•</span>
                      {s}
                    </li>
                  )) || <li>No specific strengths identified.</li>}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-3 p-4 border rounded-xl bg-red-50/30 border-red-100">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <AlertTriangle size={18} />
                  <span>Areas for Growth</span>
                </div>
                <ul className="text-sm space-y-2 text-slate-600">
                  {feedback?.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">•</span>
                      {w}
                    </li>
                  )) || <li>No critical weaknesses found.</li>}
                </ul>
              </div>
            </div>

            {/* Impact Section */}
            <div className="space-y-3 p-4 border rounded-xl border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Target size={18} className="text-accent-primary" />
                <span>The "So What?" Factor (Impact)</span>
              </div>
              <p className="text-sm text-slate-600 italic">
                {feedback?.impact ||
                  'AI analysis of your measurable achievements.'}
              </p>
            </div>

            {/* Formatting Section */}
            <div className="space-y-3 p-4 border rounded-xl border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Layout size={18} className="text-accent-primary" />
                <span>Presentation & Readability</span>
              </div>
              <p className="text-sm text-slate-600">
                {feedback?.formatting ||
                  'Evaluation of layout and ATS compatibility.'}
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3 p-4 border rounded-xl bg-blue-50/30 border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Lightbulb size={18} />
                <span>Actionable Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {feedback?.suggestions?.map((suggestion: string, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-white text-blue-600 border-blue-200 px-3 py-1"
                  >
                    {suggestion}
                  </Badge>
                )) || (
                  <span className="text-sm text-slate-500">
                    Keep up the good work!
                  </span>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
