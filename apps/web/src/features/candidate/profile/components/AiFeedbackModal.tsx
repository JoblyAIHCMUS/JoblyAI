'use client';

import React, { useState } from 'react';
import { CV_AUDIT_RULES } from '../constants/cv-audit-rules';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Info,
  Copy,
  Check,
  XCircle,
} from 'lucide-react';

interface AuditDetail {
  status: 'excellent' | 'needs_improvement' | 'critical';
  ruleName: string;
  ruleSource: string;
  critique: string;
  brokenRulesExplanation: string;
}

interface DetailedStrength {
  title: string;
  description: string;
  evidence: string;
}

interface DetailedWeakness {
  title: string;
  description: string;
  ruleBroken: string;
  evidence: string;
}

interface RewriteSuggestion {
  originalText: string;
  suggestedText: string;
  ruleApplied: string;
  explanation: string;
}

interface AiFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number | null;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    formatting: string;
    impact: string;
    auditReport?: {
      impact: AuditDetail;
      language: AuditDetail;
    };
    detailedStrengths?: DetailedStrength[];
    detailedWeaknesses?: DetailedWeakness[];
    rewriteSuggestions?: RewriteSuggestion[];
    generalAdvice?: string;
  } | null;
}

export function AiFeedbackModal({
  isOpen,
  onClose,
  feedback,
}: AiFeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<
    'audit' | 'rewriter' | 'methodology'
  >('audit');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getRuleReference = (ruleName: string) => {
    const lowerName = ruleName.toLowerCase();
    if (lowerName.includes('google')) return CV_AUDIT_RULES.google_xyz;
    if (lowerName.includes('harvard') || lowerName.includes('hbs'))
      return CV_AUDIT_RULES.harvard_verbs;
    return null;
  };

  const isLegacy = !feedback?.auditReport;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden border border-slate-100 shadow-2xl rounded-2xl bg-white font-sans">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50/80 text-indigo-650 rounded-xl border border-indigo-100/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
                AI Resume Review
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-0.5">
                Detailed evaluation based on global recruitment standards and
                actionable writing feedback.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        {!isLegacy && (
          <div className="flex px-6 border-b border-slate-100 bg-white text-[15px] shrink-0 font-medium">
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition-all ${
                activeTab === 'audit'
                  ? 'border-indigo-600 text-indigo-650 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={16} />
              AI Review
            </button>
            <button
              onClick={() => setActiveTab('rewriter')}
              className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition-all ${
                activeTab === 'rewriter'
                  ? 'border-indigo-600 text-indigo-650 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lightbulb size={16} />
              AI Suggestions
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition-all ${
                activeTab === 'methodology'
                  ? 'border-indigo-600 text-indigo-650 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen size={16} />
              Methodology & Rules
            </button>
          </div>
        )}

        <ScrollArea className="flex-1 overflow-y-auto bg-slate-50/20">
          <div className="p-6 space-y-6">
            {/* --- LEGACY FALLBACK (Old UI style but without score, using clean typography) --- */}
            {isLegacy && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Strengths */}
                  <div className="space-y-3 p-5 border rounded-2xl bg-emerald-50/10 border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Strategic Strengths</span>
                    </div>
                    <ul className="text-sm space-y-2.5 text-slate-600">
                      {feedback?.strengths?.map((s: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          {s}
                        </li>
                      )) || <li>No specific strengths identified.</li>}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-3 p-5 border rounded-2xl bg-rose-50/10 border-rose-100 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                      <AlertTriangle size={16} className="text-rose-600" />
                      <span>Areas for Growth</span>
                    </div>
                    <ul className="text-sm space-y-2.5 text-slate-600">
                      {feedback?.weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          {w}
                        </li>
                      )) || <li>No critical weaknesses found.</li>}
                    </ul>
                  </div>
                </div>

                {/* Impact */}
                <div className="space-y-3 p-5 border rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Sparkles size={16} className="text-indigo-650" />
                    <span>Impact & Metrics</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feedback?.impact ||
                      'AI analysis of your measurable achievements.'}
                  </p>
                </div>

                {/* Formatting */}
                <div className="space-y-3 p-5 border rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <BookOpen size={16} className="text-indigo-650" />
                    <span>Presentation & Readability</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feedback?.formatting ||
                      'Evaluation of layout and readability.'}
                  </p>
                </div>
              </div>
            )}

            {/* --- NEW TAB LAYOUT (Unified Typography & High Visual Contrast) --- */}
            {!isLegacy && feedback && (
              <>
                {/* 1. Tab AI REVIEW */}
                {activeTab === 'audit' && feedback.auditReport && (
                  <div className="space-y-6">
                    {/* Disclaimer Alert */}
                    <div className="p-5 bg-amber-50/40 border border-amber-100/50 rounded-2xl text-slate-700 text-sm leading-relaxed flex gap-3.5 shadow-sm">
                      <Info className="text-amber-600 w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 block mb-1">
                          Evaluation Scope Notice:
                        </span>
                        This review focuses strictly on your resume's{' '}
                        <strong className="font-semibold text-slate-900">
                          writing content quality
                        </strong>
                        —specifically measuring{' '}
                        <strong className="font-semibold text-slate-900">
                          quantitative outcomes
                        </strong>{' '}
                        (Google XYZ) and{' '}
                        <strong className="font-semibold text-slate-900">
                          active vocabulary
                        </strong>{' '}
                        (Harvard Action Verbs). Since the system analyzes raw
                        extracted text, visual layout structures, physical
                        margins, font styles, or graphical bullet points are not
                        evaluated.
                      </div>
                    </div>

                    {/* General Advice / Executive Summary */}
                    {feedback.generalAdvice && (
                      <div className="p-6 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl text-slate-700 text-[15px] leading-relaxed flex gap-4 shadow-sm">
                        <Sparkles className="text-indigo-650 w-6 h-6 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-indigo-955 block mb-1.5 text-base">
                            Executive Summary
                          </span>
                          {feedback.generalAdvice}
                        </div>
                      </div>
                    )}

                    {/* Core Rules Reports (Stacked Reports) */}
                    <div className="grid grid-cols-1 gap-6">
                      {Object.entries(feedback.auditReport).map(
                        ([key, item]) => {
                          const ref = getRuleReference(item.ruleName);
                          return (
                            <div
                              key={key}
                              className="border rounded-2xl bg-white shadow-sm border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                              {/* Card Header */}
                              <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                                <div className="space-y-0.5">
                                  <h3 className="font-bold text-slate-900 text-base md:text-lg">
                                    {item.ruleName}
                                  </h3>
                                  <p className="text-xs text-slate-500 font-semibold tracking-wide">
                                    {item.ruleSource}
                                  </p>
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="p-6 space-y-5 text-[15px]">
                                {/* Reference block */}
                                {ref && (
                                  <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl text-sm space-y-2 relative z-10">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                                      Official Guideline:
                                    </span>
                                    <p className="text-slate-700 leading-relaxed">
                                      {ref.summary}
                                    </p>
                                    <div className="pt-1 flex">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          window.open(
                                            ref.url,
                                            '_blank',
                                            'noopener,noreferrer'
                                          );
                                        }}
                                        className="inline-flex items-center gap-1 text-indigo-650 hover:underline hover:text-indigo-855 font-bold cursor-pointer text-left pointer-events-auto relative z-30"
                                      >
                                        <BookOpen
                                          size={13}
                                          className="shrink-0 text-indigo-500"
                                        />
                                        <span>
                                          Official Reference: {ref.label} &rarr;
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Critique text */}
                                <div>
                                  <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block mb-1.5">
                                    AI Analysis
                                  </span>
                                  <p className="text-slate-700 bg-indigo-50/15 p-4 rounded-xl border border-indigo-50/30 leading-relaxed text-[15px]">
                                    {item.critique}
                                  </p>
                                </div>

                                {/* Violations if any */}
                                {item.brokenRulesExplanation && (
                                  <div className="pt-1">
                                    <span className="font-bold text-rose-600 text-[11px] uppercase tracking-wider block mb-1.5">
                                      Specific Violations
                                    </span>
                                    <p className="text-slate-700 bg-rose-50/15 p-4 rounded-xl border border-rose-100/40 leading-relaxed text-[15px]">
                                      {item.brokenRulesExplanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* Detailed Strengths & Weaknesses (Key Wins & Critiques - Stacked Full-Width) */}
                    {(feedback.detailedStrengths?.length ||
                      feedback.detailedWeaknesses?.length) && (
                      <div className="space-y-8 pt-2">
                        {/* Detailed Strengths - Emerald Stripe Left */}
                        {feedback.detailedStrengths &&
                          feedback.detailedStrengths.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2 px-1">
                                <CheckCircle2
                                  size={18}
                                  className="text-emerald-600 animate-pulse"
                                />
                                Key Strategic Wins
                              </h4>
                              <div className="space-y-3.5">
                                {feedback.detailedStrengths.map((str, i) => (
                                  <div
                                    key={i}
                                    className="p-5 bg-white border border-slate-100 border-l-4 border-l-emerald-500 rounded-xl shadow-sm hover:shadow transition-shadow space-y-2.5"
                                  >
                                    <div className="font-bold text-slate-900 text-[15px] tracking-tight">
                                      {str.title}
                                    </div>
                                    <p className="text-sm text-slate-650 leading-relaxed">
                                      {str.description}
                                    </p>
                                    {str.evidence && (
                                      <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 italic">
                                        <span className="font-semibold text-slate-450 not-italic block text-[10px] uppercase tracking-wider mb-0.5">
                                          Evidence from Resume:
                                        </span>
                                        "{str.evidence}"
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Detailed Weaknesses - Rose Stripe Left */}
                        {feedback.detailedWeaknesses &&
                          feedback.detailedWeaknesses.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2 px-1">
                                <AlertTriangle
                                  size={18}
                                  className="text-rose-500"
                                />
                                Constructive Critiques
                              </h4>
                              <div className="space-y-3.5">
                                {feedback.detailedWeaknesses.map((weak, i) => (
                                  <div
                                    key={i}
                                    className="p-5 bg-white border border-slate-100 border-l-4 border-l-rose-500 rounded-xl shadow-sm hover:shadow transition-shadow space-y-3"
                                  >
                                    <div className="space-y-1.5">
                                      <div className="font-bold text-slate-900 text-[15px] tracking-tight">
                                        {weak.title}
                                      </div>
                                      <div className="text-[11px] text-rose-700 font-semibold tracking-wide flex items-center gap-1.5">
                                        <span>Rule:</span>
                                        <span className="bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                          {weak.ruleBroken}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-slate-650 leading-relaxed">
                                      {weak.description}
                                    </p>
                                    {weak.evidence && (
                                      <div className="bg-rose-50/15 p-3 rounded-lg border border-rose-100/30 text-xs text-slate-500 italic">
                                        <span className="font-semibold text-rose-450 not-italic block text-[10px] uppercase tracking-wider mb-0.5">
                                          Found in Resume:
                                        </span>
                                        "{weak.evidence}"
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Tab AI REWRITER (Comparative Cards) */}
                {activeTab === 'rewriter' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl text-slate-700 text-[15px] leading-relaxed flex gap-4 shadow-sm">
                      <Lightbulb className="text-indigo-650 w-6 h-6 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-955 block mb-1 text-base">
                          Writing Suggestions
                        </span>
                        Compare the sentences below. Swap out weak phrasings in
                        your CV for these high-impact rewrites to instantly
                        align with top recruitment standards.
                      </div>
                    </div>

                    <div className="space-y-5">
                      {feedback.rewriteSuggestions &&
                      feedback.rewriteSuggestions.length > 0 ? (
                        feedback.rewriteSuggestions.map((item, index) => (
                          <div
                            key={index}
                            className="border rounded-2xl bg-white shadow-sm border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center text-sm">
                              <span className="font-semibold text-slate-505">
                                Standard:{' '}
                                <span className="text-indigo-650 font-bold">
                                  {item.ruleApplied}
                                </span>
                              </span>
                            </div>
                            <div className="p-5 space-y-4">
                              {/* Before / After layout */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Before - Weak style */}
                                <div className="space-y-2.5 p-4 rounded-xl bg-rose-50/25 border border-rose-100/40 relative">
                                  <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                                    <XCircle size={11} />
                                    Original text
                                  </div>
                                  <p className="text-sm text-slate-650 leading-relaxed italic">
                                    "{item.originalText}"
                                  </p>
                                </div>
                                {/* After - High Impact Style */}
                                <div className="space-y-2.5 p-4 rounded-xl bg-emerald-50/20 border border-emerald-100/40 relative group">
                                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 size={11} />
                                    Suggested Rewrite
                                  </div>
                                  <p className="text-sm text-slate-800 font-semibold leading-relaxed pr-8">
                                    "{item.suggestedText}"
                                  </p>
                                  <button
                                    onClick={() =>
                                      handleCopy(item.suggestedText, index)
                                    }
                                    className="absolute right-3 top-3 p-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-350 rounded shadow-sm text-slate-500 transition-all active:scale-95 z-10"
                                    title="Copy to clipboard"
                                  >
                                    {copiedIndex === index ? (
                                      <Check
                                        size={14}
                                        className="text-emerald-600"
                                      />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                </div>
                              </div>
                              {/* Rationale */}
                              <div className="pt-3 border-t border-slate-50 text-sm text-slate-500 flex items-start gap-2 leading-relaxed">
                                <ArrowRight
                                  size={14}
                                  className="text-indigo-500 shrink-0 mt-0.5"
                                />
                                <span>
                                  <span className="font-bold text-slate-700">
                                    Review Rationale:{' '}
                                  </span>
                                  {item.explanation}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                          No rewrites needed! Your achievements are already
                          strong and well-quantified.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Tab METHODOLOGY (Dynamic Map) */}
                {activeTab === 'methodology' && (
                  <div className="space-y-5 relative z-10 pointer-events-auto">
                    <div className="space-y-4">
                      {Object.values(CV_AUDIT_RULES).map((rule) => (
                        <div
                          key={rule.key}
                          className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2.5 shadow-sm hover:shadow-md transition-shadow relative z-10 pointer-events-auto"
                        >
                          <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-650"></span>
                            {rule.label}
                          </h4>
                          <p className="text-sm text-slate-650 leading-relaxed font-sans">
                            {rule.fullDescription}
                          </p>
                          <div className="flex pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(
                                  rule.url,
                                  '_blank',
                                  'noopener,noreferrer'
                                );
                              }}
                              className="text-sm font-bold text-indigo-650 hover:underline hover:text-indigo-855 cursor-pointer text-left pointer-events-auto relative z-30"
                            >
                              Visit Official Resource &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AiFeedbackModal;
