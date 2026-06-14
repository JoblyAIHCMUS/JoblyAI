import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layout,
  Target,
  X,
} from 'lucide-react-native';

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
  } | null;
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (score >= 50) return { text: '#ca8a04', bg: '#fefce8', border: '#fef08a' };
  return { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

export function AiFeedbackModal({
  isOpen,
  onClose,
  score,
  feedback,
}: AiFeedbackModalProps) {
  const displayScore = score !== null ? Math.round(score * 100) : null;
  const colors = displayScore ? getScoreColor(displayScore) : null;

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/40 px-4">
        <View
          className="w-full max-w-lg rounded-xl bg-white overflow-hidden"
          style={{ maxHeight: '90%' }}
        >
          <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-[#dbe1ee]">
            <View className="flex flex-row items-center gap-2">
              <Sparkles size={20} color="#4f46e5" />
              <Text className="text-lg font-semibold text-[#1f2937]">
                AI Resume Analysis
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5 py-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5 pb-6">
              <View className="items-center py-6 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <Text className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1">
                  Overall Strategic Score
                </Text>
                <Text
                  className="text-4xl font-bold"
                  style={{ color: colors?.text || '#94a3b8' }}
                >
                  {displayScore ?? '--'}
                  <Text className="text-xl text-[#94a3b8]">/100</Text>
                </Text>
              </View>

              <View className="flex gap-4">
                <View className="p-4 rounded-xl border bg-[#f0fdf4] border-[#bbf7d0]">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <CheckCircle2 size={16} color="#16a34a" />
                    <Text className="text-sm font-semibold text-[#16a34a]">
                      Strategic Strengths
                    </Text>
                  </View>
                  {feedback?.strengths?.length ? (
                    feedback.strengths.map((s, i) => (
                      <Text key={i} className="text-sm text-[#374151] mb-1">
                        • {s}
                      </Text>
                    ))
                  ) : (
                    <Text className="text-sm text-[#6b7280]">
                      No specific strengths identified.
                    </Text>
                  )}
                </View>

                <View className="p-4 rounded-xl border bg-[#fef2f2] border-[#fecaca]">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <AlertTriangle size={16} color="#dc2626" />
                    <Text className="text-sm font-semibold text-[#dc2626]">
                      Areas for Growth
                    </Text>
                  </View>
                  {feedback?.weaknesses?.length ? (
                    feedback.weaknesses.map((w, i) => (
                      <Text key={i} className="text-sm text-[#374151] mb-1">
                        • {w}
                      </Text>
                    ))
                  ) : (
                    <Text className="text-sm text-[#6b7280]">
                      No critical weaknesses found.
                    </Text>
                  )}
                </View>
              </View>

              <View className="p-4 rounded-xl border border-[#e2e8f0]">
                <View className="flex flex-row items-center gap-2 mb-2">
                  <Target size={16} color="#4f46e5" />
                  <Text className="text-sm font-semibold text-[#1f2937]">
                    The "So What?" Factor (Impact)
                  </Text>
                </View>
                <Text className="text-sm text-[#6b7280] italic">
                  {feedback?.impact ||
                    'AI analysis of your measurable achievements.'}
                </Text>
              </View>

              <View className="p-4 rounded-xl border border-[#e2e8f0]">
                <View className="flex flex-row items-center gap-2 mb-2">
                  <Layout size={16} color="#4f46e5" />
                  <Text className="text-sm font-semibold text-[#1f2937]">
                    Presentation & Readability
                  </Text>
                </View>
                <Text className="text-sm text-[#6b7280]">
                  {feedback?.formatting ||
                    'Evaluation of layout and ATS compatibility.'}
                </Text>
              </View>

              <View className="p-4 rounded-xl border bg-[#eff6ff] border-[#bfdbfe]">
                <View className="flex flex-row items-center gap-2 mb-2">
                  <Lightbulb size={16} color="#2563eb" />
                  <Text className="text-sm font-semibold text-[#2563eb]">
                    Actionable Suggestions
                  </Text>
                </View>
                {feedback?.suggestions?.length ? (
                  <View className="flex flex-row flex-wrap gap-2">
                    {feedback.suggestions.map((suggestion, i) => (
                      <View
                        key={i}
                        className="bg-white px-3 py-1 rounded-full border border-[#bfdbfe]"
                      >
                        <Text className="text-xs text-[#2563eb]">
                          {suggestion}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-[#6b7280]">
                    Keep up the good work!
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default AiFeedbackModal;
