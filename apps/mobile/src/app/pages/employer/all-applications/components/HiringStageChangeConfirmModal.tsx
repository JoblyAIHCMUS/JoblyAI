import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';

import { COLORS } from '../../../../constants/theme';

type ActionType = 'advance' | 'reject';

interface HiringStageChangeConfirmModalProps {
  visible: boolean;
  actionType: ActionType | null;
  currentStage?: string;
  nextStage?: string;
  applicantName?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const HiringStageChangeConfirmModal: React.FC<
  HiringStageChangeConfirmModalProps
> = ({
  visible,
  actionType,
  currentStage,
  nextStage,
  applicantName,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  if (!actionType) return null;

  const isAdvance = actionType === 'advance';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/30 justify-center items-center px-4">
        <View className="bg-white rounded-3xl w-full max-w-sm px-6 py-8 shadow-lg items-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-4"
            style={{
              backgroundColor: isAdvance ? COLORS.tagGreenBg : COLORS.tagRedBg,
            }}
          >
            {isAdvance ? (
              <CheckCircle2 size={24} color={COLORS.tagGreenText} strokeWidth={2} />
            ) : (
              <AlertCircle size={24} color={COLORS.tagRedText} strokeWidth={2} />
            )}
          </View>

          <Text className="text-lg font-semibold text-app-dark-text mb-2 text-center">
            {isAdvance ? `Advance to ${nextStage ?? 'next stage'}?` : 'Reject Applicant?'}
          </Text>

          <Text className="text-sm text-app-gray-3 mb-6 text-center">
            {isAdvance
              ? applicantName
                ? `This action will move ${applicantName} to the next hiring stage.`
                : 'This action will move the applicant to the next hiring stage.'
              : 'This action will reject the applicant. This decision is final and cannot be undone.'}
          </Text>

          <View className="flex-row gap-2 w-full">
            <TouchableOpacity
              disabled={loading}
              onPress={onCancel}
              className="flex-1 py-2 rounded-lg border border-app-border-2 bg-white"
              activeOpacity={0.7}
            >
              <Text className="text-center text-app-slate-1 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              onPress={onConfirm}
              className="flex-1 py-2 rounded-lg"
              style={{
                backgroundColor: isAdvance ? '#22C55E' : COLORS.error,
                opacity: loading ? 0.7 : 1,
              }}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white font-semibold">
                  {isAdvance ? 'Advance' : 'Reject'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
