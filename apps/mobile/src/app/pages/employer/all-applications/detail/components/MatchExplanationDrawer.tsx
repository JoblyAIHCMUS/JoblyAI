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
} from 'lucide-react-native';
import { useMatchExplanation } from '../../../../../../hooks/useMatchExplanation';

interface MatchExplanationDrawerProps {
  applicationId: string | number;
  isOpen: boolean;
  onClose: () => void;
}

function getSimilarityColor(similarity: number) {
  if (similarity >= 0.8) return '#15803d';
  if (similarity >= 0.6) return '#1d4ed8';
  if (similarity >= 0.4) return '#a16207';
  if (similarity >= 0) return '#c2410c';
  return '#b91c1c';
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
  } = useMatchExplanation(isOpen ? applicationId : null);

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/40 px-3">
        <View
          className="w-full max-w-lg rounded-xl bg-white overflow-hidden"
          style={{ maxHeight: '92%' }}
        >
          <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-[#dbe1ee]">
            <View className="flex flex-row items-center gap-2">
              <Briefcase size={20} color="#4f46e5" />
              <Text className="text-lg font-semibold text-[#1f2937]">
                Match Analysis
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5 py-4"
            showsVerticalScrollIndicator={false}
          >
            <Text className="mb-4 text-sm text-[#6b7280]">
              Detailed breakdown of how this candidate matches the job
              requirements.
            </Text>

            {isLoading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color="#4f46e5" />
              </View>
            ) : isError || !explanation ? (
              <View className="items-center justify-center py-12">
                <AlertTriangle size={28} color="#d97706" />
                <Text className="mt-2 text-sm text-[#6b7280] text-center">
                  No match explanation available.
                </Text>
              </View>
            ) : (
              <View className="gap-4 pb-4">
                <View className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <CheckCircle2 size={16} color="#16a34a" />
                    <Text className="text-sm font-semibold text-[#1f2937]">
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
                      <Text className="text-xl text-[#94a3b8]">%</Text>
                    </Text>
                    <Text className="text-xs text-[#6b7280]">
                      semantic similarity
                    </Text>
                  </View>
                </View>

                <View className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Clock size={16} color="#ca8a04" />
                    <Text className="text-sm font-semibold text-[#1f2937]">
                      Experience
                    </Text>
                  </View>
                  <Text className="text-sm text-[#6b7280]">
                    Career span:{' '}
                    <Text className="font-medium text-[#1f2937]">
                      {explanation.experienceYears} years
                    </Text>
                  </Text>
                </View>

                <View>
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Briefcase size={16} color="#4f46e5" />
                    <Text className="text-sm font-semibold text-[#1f2937]">
                      Requirements
                    </Text>
                  </View>

                  {explanation.requirementMatches.length === 0 ? (
                    <View className="rounded-xl border border-[#e2e8f0] p-4">
                      <Text className="text-sm text-[#6b7280]">
                        This job doesn&apos;t list any specific skill
                        requirements.
                      </Text>
                    </View>
                  ) : (
                    <View className="gap-2">
                      {explanation.requirementMatches.map((req, index) => (
                        <View
                          key={index}
                          className="rounded-xl border border-[#e2e8f0] bg-white p-3"
                        >
                          <View className="flex flex-row items-center justify-between gap-2">
                            <View className="flex flex-row items-center gap-2 flex-1 flex-wrap">
                              <Text className="text-sm font-semibold text-[#1f2937]">
                                {req.skillName}
                              </Text>
                              <View
                                className={`px-2 py-0.5 rounded border ${getImportanceClasses(
                                  req.importance
                                )}`}
                              >
                                <Text className="text-[10px] font-medium">
                                  {getImportanceLabel(req.importance)}
                                </Text>
                              </View>
                            </View>
                            {req.hardConstraintMet && (
                              <View className="bg-green-100 px-2 py-0.5 rounded">
                                <Text className="text-[10px] font-semibold text-green-700">
                                  Strong match
                                </Text>
                              </View>
                            )}
                          </View>
                          {req.minYearsRequired ? (
                            <Text className="mt-1 text-xs text-[#6b7280]">
                              Min experience: {req.minYearsRequired} years
                            </Text>
                          ) : null}
                          <View className="mt-1 flex flex-row items-center gap-2">
                            <Text className="text-xs text-[#6b7280]">
                              Similarity:
                            </Text>
                            <Text
                              className="text-sm font-semibold"
                              style={{
                                color: getSimilarityColor(
                                  req.embeddingSimilarity
                                ),
                              }}
                            >
                              {(req.embeddingSimilarity * 100).toFixed(0)}%
                            </Text>
                          </View>
                          {req.justification ? (
                            <Text className="mt-1 text-sm text-[#6b7280]">
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
