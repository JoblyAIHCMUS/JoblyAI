'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Clock,
} from 'lucide-react';
import {
  getMatchExplanation,
  recalculateMatchExplanation,
  type MatchExplanation,
} from '@/api-client/matching/explanation';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';

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
  const [scoringMode, setScoringMode] = useState<'exact' | 'embedding'>(
    'embedding'
  );

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchExplanation();
    }
  }, [isOpen, applicationId, scoringMode]);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const data = await getMatchExplanation(
        Number(applicationId),
        scoringMode
      );
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
      const data = await recalculateMatchExplanation(
        Number(applicationId),
        scoringMode
      );
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
            <Select
              value={scoringMode}
              onValueChange={(value: 'exact' | 'embedding') =>
                setScoringMode(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Exact Match</SelectItem>
                <SelectItem value="embedding">Embedding</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="space-y-6">
              {/* Score */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h3 className="font-semibold">
                    {scoringMode === 'exact'
                      ? 'Exact Match Score'
                      : 'Embedding Score'}
                  </h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-bold ${getScoreColor(
                      (scoringMode === 'exact'
                        ? explanation.exactMatchScore ?? 0
                        : explanation.overallScore ?? 0) / 100
                    )}`}
                  >
                    {(scoringMode === 'exact'
                      ? explanation.exactMatchScore ?? 0
                      : explanation.overallScore ?? 0
                    ).toFixed(2)}
                    %
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {scoringMode === 'exact'
                      ? 'requirements met'
                      : 'semantic similarity'}
                  </span>
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

              {/* Requirement Breakdown */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  <h3 className="font-semibold">Requirements</h3>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {scoringMode === 'exact'
                      ? 'Exact match only'
                      : 'Embedding only'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {explanation.requirementMatches.map((req, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{req.skillName}</span>
                          {getImportanceBadge(req.importance)}
                        </div>
                        {req.hardConstraintMet && (
                          <Badge
                            variant="default"
                            className="bg-green-500 text-white hover:bg-green-600"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Strong Match
                          </Badge>
                        )}
                      </div>
                      {req.minYearsRequired ? (
                        <div className="mb-1 text-xs text-muted-foreground">
                          Min experience: {req.minYearsRequired} years
                        </div>
                      ) : null}

                      {/* Hard constraint status - show in exact mode */}
                      {scoringMode === 'exact' && (
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Hard constraint:
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              req.hardConstraintMet
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {req.hardConstraintMet ? 'Met' : 'Not met'}
                          </span>
                        </div>
                      )}

                      {/* Embedding similarity - show in embedding mode */}
                      {scoringMode === 'embedding' && (
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Similarity:
                          </span>
                          <span
                            className={`text-sm font-semibold ${getScoreColor(
                              req.embeddingSimilarity
                            )}`}
                          >
                            {req.embeddingSimilarity > 0
                              ? `${(req.embeddingSimilarity * 100).toFixed(2)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        {req.justification}
                      </div>
                    </div>
                  ))}
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
    </Modal>
  );
}
