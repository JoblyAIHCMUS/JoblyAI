import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  CheckCircle2,
  Briefcase,
  Clock,
  AlertTriangle,
  Target,
} from 'lucide-react-native';
import { useMatchExplanation } from '../../../../../../hooks/useMatchExplanation';
import { COLORS } from '@/app/constants/theme';

interface MatchExplanationDrawerProps {
  applicationId: string | number;
  isOpen: boolean;
  onClose: () => void;
}

function getSimilarityColor(similarity: number) {
  if (similarity >= 0.8) return COLORS.successDark;
  if (similarity >= 0.6) return COLORS.infoDark;
  if (similarity >= 0.4) return COLORS.warningMedium;
  if (similarity >= 0) return COLORS.orangeDark;
  return COLORS.dangerDark;
}

function getImportanceLabel(importance: string) {
  switch (importance) {
    case 'REQUIRED':
      return 'Required';
    case 'PREFERRED':
      return 'Preferred';
    case 'OPTIONAL':
      return 'Optional';
    default:
      return importance;
  }
}

function getImportanceClasses(importance: string) {
  switch (importance) {
    case 'REQUIRED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'PREFERRED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'OPTIONAL':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function MatchExplanationDrawer({
  applicationId,
  isOpen,
  onClose,
}: MatchExplanationDrawerProps) {
  const {
    data: explanation,
    isLoading,
    isError,
  } = useMatchExplanation(applicationId);

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/40 px-3">
        <View
          className="w-full max-w-lg rounded-xl bg-white overflow-hidden"
          style={{ maxHeight: '92%' }}
        >
          <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-app-border-light">
            <View className="flex flex-row items-center gap-2">
              <Briefcase size={20} color={COLORS.primary2} />
              <Text className="text-lg font-semibold text-app-dark-text">
                Match Analysis
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="min-h-11 min-w-11 items-center justify-center"
            >
              <X size={20} color={COLORS.gray3} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5 py-4"
            showsVerticalScrollIndicator={false}
          >
            <Text className="mb-4 text-sm text-app-gray-3">
              Detailed breakdown of how this candidate matches the job
              requirements.
            </Text>

            {isLoading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color={COLORS.primary2} />
              </View>
            ) : isError || !explanation ? (
              <View className="items-center justify-center py-12">
                <AlertTriangle size={28} color={COLORS.warningText} />
                <Text className="mt-2 text-sm text-app-gray-3 text-center">
                  No match explanation available.
                </Text>
              </View>
            ) : (
              <View className="gap-4 pb-4">
                <View className="rounded-xl border border-app-slate-2 bg-app-bg-input p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <CheckCircle2 size={16} color={COLORS.typeFullTime} />
                    <Text className="text-sm font-semibold text-app-dark-text">
                      Embedding Score
                    </Text>
                  </View>
                  <View className="flex flex-row items-baseline gap-2">
                    <Text
                      className="text-4xl font-bold"
                      style={{
                        color: getSimilarityColor(
                          (explanation.overallScore ?? 0) / 100
                        ),
                      }}
                    >
                      {(explanation.overallScore ?? 0).toFixed(2)}
                      <Text className="text-xl text-app-slate-3">%</Text>
                    </Text>
                    <Text className="text-xs text-app-gray-3">
                      semantic similarity
                    </Text>
                  </View>
                </View>

                <View className="rounded-xl border border-app-slate-2 bg-app-bg-input p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Target size={16} color={COLORS.typeContract} />
                    <Text className="text-sm font-semibold text-app-dark-text">
                      Exact Match Score
                    </Text>
                  </View>
                  <View className="flex flex-row items-baseline gap-2">
                    <Text
                      className="text-4xl font-bold"
                      style={{
                        color: getSimilarityColor(
                          (explanation.exactMatchScore ?? 0) / 100
                        ),
                      }}
                    >
                      {(explanation.exactMatchScore ?? 0).toFixed(2)}
                      <Text className="text-xl text-app-slate-3">%</Text>
                    </Text>
                    <Text className="text-xs text-app-gray-3">
                      requirements met
                    </Text>
                  </View>
                </View>

                <View className="rounded-xl border border-app-slate-2 bg-app-bg-input p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Clock size={16} color={COLORS.badgeOrange} />
                    <Text className="text-sm font-semibold text-app-dark-text">
                      Experience
                    </Text>
                  </View>
                  <Text className="text-sm text-app-gray-3">
                    Career span:{' '}
                    <Text className="font-medium text-app-dark-text">
                      {explanation.experienceYears} years
                    </Text>
                  </Text>
                </View>

                <View>
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Briefcase size={16} color={COLORS.primary2} />
                    <Text className="text-sm font-semibold text-app-dark-text">
                      Requirements
                    </Text>
                  </View>

                  {explanation.requirementMatches.length === 0 ? (
                    <View className="rounded-xl border border-app-slate-2 p-4">
                      <Text className="text-sm text-app-gray-3">
                        This job doesn&apos;t list any specific skill
                        requirements.
                      </Text>
                    </View>
                  ) : (
                    <View className="gap-3">
                      {explanation.requirementMatches.map((req, index) => (
                        <View
                          key={index}
                          className="rounded-xl border border-app-slate-2 bg-white p-3 pb-4"
                        >
                          <Text className="text-sm font-semibold text-app-dark-text mb-1.5">
                            {req.skillName}
                          </Text>
                          <View className="flex flex-row items-center gap-2 flex-wrap">
                            <View className="flex flex-row items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                              <Text className="text-[10px] text-app-gray-3">
                                embedding
                              </Text>
                              <Text
                                className="text-[10px] font-semibold"
                                style={{
                                  color: getSimilarityColor(
                                    req.embeddingSimilarity
                                  ),
                                }}
                              >
                                {(req.embeddingSimilarity * 100).toFixed(0)}%
                              </Text>
                            </View>
                            <View
                              className={`flex flex-row items-center gap-1 px-2 py-0.5 rounded border ${
                                req.hardConstraintMet
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <Text className="text-[10px] text-app-gray-3">
                                exact
                              </Text>
                              <Text
                                className={`text-[10px] font-semibold ${
                                  req.hardConstraintMet
                                    ? 'text-green-700'
                                    : 'text-red-600'
                                }`}
                              >
                                {req.hardConstraintMet ? 'met' : 'not met'}
                              </Text>
                            </View>
                          </View>
                          {req.minYearsRequired ? (
                            <Text className="mt-1.5 text-xs text-app-gray-3">
                              Min experience: {req.minYearsRequired} years
                            </Text>
                          ) : null}
                          {req.justification ? (
                            <Text className="mt-1 text-xs text-app-gray-3">
                              {req.justification}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default MatchExplanationDrawer;
