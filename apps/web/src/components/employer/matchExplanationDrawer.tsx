'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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
  XCircle,
  AlertTriangle,
  Search,
  Trophy,
  Target,
  Briefcase,
  Star,
  Calculator,
} from 'lucide-react';
import {
  getMatchExplanation,
  recalculateMatchExplanation,
  type MatchExplanation,
  type RequirementMatch,
} from '@/api-client/matching/explanation';

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
  const [scoringMode, setScoringMode] = useState<'hybrid' | 'exact' | 'embedding'>('hybrid');

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

  const getCurrentScore = () => {
    if (!explanation) return 0;
    switch (scoringMode) {
      case 'exact':
        return explanation.exactScore;
      case 'embedding':
        return explanation.embeddingScore;
      default:
        return explanation.hybridScore;
    }
  };

  const getCurrentRequirementPercentage = () => {
    if (!explanation?.scoreBreakdown) return 0;
    const { exactPercentage, embeddingPercentage } = explanation.scoreBreakdown;
    switch (scoringMode) {
      case 'exact':
        return exactPercentage;
      case 'embedding':
        return embeddingPercentage;
      default:
        return exactPercentage * 0.3 + embeddingPercentage * 0.7;
    }
  };

  const getFormula = () => {
    if (!explanation?.scoreBreakdown) return '';
    const reqPct = getCurrentRequirementPercentage();
    const expScore = explanation.scoreBreakdown.experienceScore;
    const final = getCurrentScore();
    return `Final = ReqScore(${Math.round(reqPct)}) × 0.6 + ExpScore(${Math.round(expScore)}) × 0.4 = ${final}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: RequirementMatch['status']) => {
    switch (status) {
      case 'strong_match':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Strong Match
          </Badge>
        );
      case 'match':
        return (
          <Badge variant="default" className="bg-blue-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Match
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="secondary">
            <Search className="mr-1 h-3 w-3" />
            Partial
          </Badge>
        );
      case 'no_match':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            No Match
          </Badge>
        );
    }
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Match Analysis</span>
            <div className="flex items-center gap-2">
              <Select
                value={scoringMode}
                onValueChange={(value: 'hybrid' | 'exact' | 'embedding') =>
                  setScoringMode(value)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="exact">Exact Only</SelectItem>
                  <SelectItem value="embedding">Embedding</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRecalculate}
                disabled={recalculating}
              >
                {recalculating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </SheetTitle>
          <SheetDescription>
            Detailed breakdown of how this candidate matches the job requirements
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : explanation ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="rounded-lg border p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Overall Score
                </div>
                <div
                  className={`text-4xl font-bold ${getScoreColor(getCurrentScore())}`}
                >
                  {getCurrentScore()}/100
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${getCurrentScore()}%` }}
                  />
                </div>
              </div>

              {/* Scoring Formula */}
              {explanation.scoreBreakdown && (
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-orange-500" />
                    <h3 className="font-semibold">Scoring Formula</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="rounded bg-muted p-2 font-mono text-xs">
                      {getFormula()}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Requirements:</span>{' '}
                        <span className="font-medium">
                          {getCurrentRequirementPercentage().toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Experience:</span>{' '}
                        <span className="font-medium">
                          {explanation.scoreBreakdown.experienceScore.toFixed(1)} pts
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Exact match:</span>{' '}
                        <span className="font-medium text-green-600">
                          {explanation.scoreBreakdown.exactPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Embedding:</span>{' '}
                        <span className="font-medium text-blue-600">
                          {explanation.scoreBreakdown.embeddingPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-2 text-xs text-muted-foreground">
                      Final = ReqScore × 0.6 + ExpScore × 0.4
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tier */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <h3 className="font-semibold">Experience Tier</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Years:</span>{' '}
                    <span className="font-medium">
                      {explanation.experienceTier.totalYears.toFixed(1)} years
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tier:</span>{' '}
                    <span className="font-medium">
                      {explanation.experienceTier.tierLabel}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Base Score:</span>{' '}
                    <span className="font-medium">
                      {explanation.experienceTier.baseScore} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Alignment Matrix */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold">Alignment Matrix</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Job Tier:</span>{' '}
                    <span className="font-medium">
                      {explanation.alignment.jobTier}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Your Tier:</span>{' '}
                    <span className="font-medium">
                      {explanation.alignment.candidateTier}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Distance:</span>{' '}
                    <span className="font-medium">
                      {explanation.alignment.distance > 0 ? '+' : ''}
                      {explanation.alignment.distance}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Multiplier:</span>{' '}
                    <span className="font-medium">
                      {explanation.alignment.multiplier}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Boosters */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-500" />
                  <h3 className="font-semibold">
                    Quality Boosters: +{explanation.qualityBoosters.total} pts
                  </h3>
                </div>
                <div className="space-y-2">
                  {explanation.qualityBoosters.breakdown.map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Requirement Breakdown */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  <h3 className="font-semibold">Requirement Breakdown</h3>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {scoringMode === 'exact' ? 'Exact scores' : scoringMode === 'embedding' ? 'Embedding scores' : 'Both scores'}
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
                        {getStatusBadge(req.status)}
                      </div>
                      {req.minYearsRequired ? (
                        <div className="mb-1 text-xs text-muted-foreground">
                          Min experience: {req.minYearsRequired} years
                        </div>
                      ) : null}

                      {/* Mode-specific score display */}
                      {scoringMode === 'exact' && (
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <span className={`text-sm font-semibold ${getScoreColor(req.exactScore)}`}>
                            {req.exactScore.toFixed(0)}
                          </span>
                        </div>
                      )}
                      {scoringMode === 'embedding' && (
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <span className={`text-sm font-semibold ${getScoreColor(req.embeddingScore)}`}>
                            {req.embeddingScore.toFixed(0)}
                          </span>
                        </div>
                      )}
                      {scoringMode === 'hybrid' && (
                        <div className="mb-1 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Exact:</span>
                            <span className={`text-xs font-semibold ${getScoreColor(req.exactScore)}`}>
                              {req.exactScore.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Embed:</span>
                            <span className={`text-xs font-semibold ${getScoreColor(req.embeddingScore)}`}>
                              {req.embeddingScore.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        {req.justification}
                      </div>
                      {req.exactMatch.found && (
                        <div className="mt-2 text-xs text-green-600">
                          ✓ Exact match: {req.exactMatch.candidateYears} years
                          {req.exactMatch.candidateLevel &&
                            ` (${req.exactMatch.candidateLevel})`}
                        </div>
                      )}
                      {req.embeddingMatch?.matched && (
                        <div className="mt-2 text-xs text-blue-600">
                          🔍 Embedding: {(req.embeddingMatch.similarity * 100).toFixed(0)}% similarity
                        </div>
                      )}
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
      </SheetContent>
    </Sheet>
  );
}
