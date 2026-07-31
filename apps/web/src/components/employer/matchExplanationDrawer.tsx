'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Clock,
  Info,
} from 'lucide-react';
import {
  getMatchExplanation,
  recalculateMatchExplanation,
  type MatchExplanation,
} from '@/api-client/matching/explanation';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';
import { MatchScoringInfoModal } from './MatchScoringInfoModal';

interface MatchExplanationDrawerProps {
  applicationId: string | number;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchExplanationDrawer({
  applicationId,
  isOpen,
  onClose,
}: MatchExplanationDrawerProps) {
  const [explanation, setExplanation] = useState<MatchExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchExplanation();
    }
  }, [isOpen, applicationId]);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const data = await getMatchExplanation(Number(applicationId));
      setExplanation(data);
    } catch (error) {
      console.error('Failed to fetch match explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const data = await recalculateMatchExplanation(Number(applicationId));
      setExplanation(data);
    } catch (error) {
      console.error('Failed to recalculate match explanation:', error);
    } finally {
      setRecalculating(false);
    }
  };

  const getScoreColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600';
    if (similarity >= 0.6) return 'text-blue-600';
    if (similarity >= 0.4) return 'text-yellow-600';
    if (similarity >= 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getImportanceBadge = (importance: string) => {
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[95vw] max-h-[95vh]"
      zIndex={100}
    >
      <ModalHeader onClose={onClose} />
      <ModalBody>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Match Analysis</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInfoOpen(true)}
              title="How scoring works"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={recalculating}
            >
              {recalculating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Recalculate
            </Button>
          </div>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Detailed breakdown of how this candidate matches the job requirements
        </p>

        <ScrollArea className="h-[calc(100vh-250px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : explanation ? (
            <div className="space-y-6 pr-2.5">
              {/* Score — Side by Side */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <h3 className="font-semibold">Embedding Score</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(
                        (explanation.overallScore ?? 0) / 100
                      )}`}
                    >
                      {(explanation.overallScore ?? 0).toFixed(2)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      semantic similarity
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-500" />
                    <h3 className="font-semibold">Exact Match Score</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(
                        (explanation.exactMatchScore ?? 0) / 100
                      )}`}
                    >
                      {(explanation.exactMatchScore ?? 0).toFixed(2)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      requirements met
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Experience */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <h3 className="font-semibold">Experience</h3>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Career span:</span>{' '}
                  <span className="font-medium">
                    {explanation.experienceYears} years
                  </span>
                </div>
              </div>

              <Separator />

              {/* Requirement Breakdown — Side by Side */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  <h3 className="font-semibold">Requirements</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
                  {/* Embedding column */}
                  <div>
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        Embedding
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {explanation.requirementMatches.map((req, index) => (
                        <div
                          key={`emb-${index}`}
                          className="rounded-lg border p-3"
                        >
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {req.skillName}
                              </span>
                              {getImportanceBadge(req.importance)}
                            </div>
                            <span
                              className={`text-sm font-semibold ${getScoreColor(
                                req.embeddingSimilarity
                              )}`}
                            >
                              {(req.embeddingSimilarity * 100).toFixed(0)}%
                            </span>
                          </div>
                          {req.minYearsRequired ? (
                            <div className="text-xs text-muted-foreground">
                              Min experience: {req.minYearsRequired} years
                            </div>
                          ) : null}
                          <div className="mt-1 text-sm text-muted-foreground">
                            {req.justification}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator
                    orientation="vertical"
                    className="hidden sm:block"
                  />

                  {/* Exact Match column */}
                  <div>
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        Exact Match
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {explanation.requirementMatches.map((req, index) => (
                        <div
                          key={`exact-${index}`}
                          className="rounded-lg border p-3"
                        >
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {req.skillName}
                              </span>
                              {getImportanceBadge(req.importance)}
                            </div>
                            {req.hardConstraintMet ? (
                              <Badge
                                variant="default"
                                className="bg-green-500 text-white hover:bg-green-600"
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Met
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Not met</Badge>
                            )}
                          </div>
                          {req.minYearsRequired ? (
                            <div className="text-xs text-muted-foreground">
                              Min experience: {req.minYearsRequired} years
                            </div>
                          ) : null}
                          <div className="mt-1 text-sm text-muted-foreground">
                            {req.justification}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <AlertTriangle className="mb-4 h-8 w-8" />
              <p>No match explanation available</p>
              <p className="text-sm">
                Click recalculate to generate an explanation
              </p>
            </div>
          )}
        </ScrollArea>
      </ModalBody>
      <MatchScoringInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </Modal>
  );
}
