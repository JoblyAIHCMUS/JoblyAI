'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useJobResumeMatchExplanation } from '@/api-hook/matching/useJobResumeMatchExplanation';

interface CandidateMatchExplanationSectionProps {
  jobId: number;
  resumeId: number;
}

function getScoreColor(similarity: number) {
  if (similarity >= 0.8) return 'text-green-600';
  if (similarity >= 0.6) return 'text-blue-600';
  if (similarity >= 0.4) return 'text-yellow-600';
  if (similarity >= 0) return 'text-orange-600';
  return 'text-red-600';
}

function getImportanceBadge(importance: string) {
  switch (importance) {
    case 'REQUIRED':
      return <Badge variant="destructive">Required</Badge>;
    case 'PREFERRED':
      return <Badge variant="secondary">Preferred</Badge>;
    case 'OPTIONAL':
      return <Badge variant="outline">Optional</Badge>;
    default:
      return null;
  }
}

export function CandidateMatchExplanationSection({
  jobId,
  resumeId,
}: CandidateMatchExplanationSectionProps) {
  const {
    fetchExplanation,
    loading,
    data: explanation,
  } = useJobResumeMatchExplanation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchExplanation(jobId, resumeId).catch((err) => {
      if (cancelled) return;
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't analyse this resume yet."
      );
    });
    return () => {
      cancelled = true;
    };
  }, [jobId, resumeId, fetchExplanation]);

  return (
    <section className="border border-indigo-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-600 p-2 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            How well you match this job
          </h2>
          <p className="text-sm text-slate-600">
            Based on your resume, here&apos;s how you line up against the
            requirements.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-600">
          <AlertTriangle className="mb-2 h-6 w-6" />
          <p className="text-sm">{error}</p>
        </div>
      ) : explanation ? (
        <div className="space-y-5">
          {/* Score + Experience row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Embedding Score
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${getScoreColor(
                    (explanation.overallScore ?? 0) / 100
                  )}`}
                >
                  {(explanation.overallScore ?? 0).toFixed(2)}%
                </span>
                <span className="text-xs text-slate-500">semantic match</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Experience
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {explanation.experienceYears}
                </span>
                <span className="text-xs text-slate-500">
                  years career span
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Requirement Breakdown */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Requirements
              </h3>
              <Badge variant="outline" className="ml-auto text-xs">
                Embedding
              </Badge>
            </div>
            {explanation.requirementMatches.length === 0 ? (
              <p className="text-sm text-slate-600">
                This job doesn&apos;t list any specific skill requirements.
              </p>
            ) : (
              <div className="space-y-2">
                {explanation.requirementMatches.map((req, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {req.skillName}
                        </span>
                        {getImportanceBadge(req.importance)}
                      </div>
                      <div className="flex items-center gap-2">
                        {req.hardConstraintMet && (
                          <Badge className="bg-green-500 text-white hover:bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Strong match
                          </Badge>
                        )}
                        <span
                          className={`text-sm font-bold ${getScoreColor(
                            req.embeddingSimilarity
                          )}`}
                        >
                          {(req.embeddingSimilarity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {req.minYearsRequired ? (
                      <div className="text-xs text-slate-500">
                        Min experience: {req.minYearsRequired} years
                      </div>
                    ) : null}
                    <div className="mt-1 text-sm text-slate-600">
                      {req.justification}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-600">
          <AlertTriangle className="mb-2 h-6 w-6" />
          <p className="text-sm">We couldn&apos;t analyse this resume yet.</p>
        </div>
      )}
    </section>
  );
}
