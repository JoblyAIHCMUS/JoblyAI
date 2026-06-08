import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ApplicantStatus } from './ApplicantsTab';

interface ChangeStageModalProps {
  isVisible: boolean;
  onClose: () => void;
  applicantName: string;
  currentStage: ApplicantStatus;
  onConfirm: (stage: ApplicantStatus) => void;
}

// Valid forward transitions only (can only move forward, not backward)
const VALID_TRANSITIONS: Record<ApplicantStatus, ApplicantStatus[]> = {
  'In-review': ['Interviewed', 'Rejected'],
  Interviewed: ['Hired', 'Rejected'],
  Hired: ['Rejected'],
  Rejected: [],
  Withdrawn: [],
};

export const ChangeStageModal: React.FC<ChangeStageModalProps> = ({
  isVisible,
  onClose,
  applicantName,
  currentStage,
  onConfirm,
}) => {
  const availableStages = VALID_TRANSITIONS[currentStage] || [];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl w-full p-6 shadow-xl">
          <Text className="text-xl font-bold text-app-slate-1 mb-2 text-center">
            Change Stage
          </Text>
          <Text className="text-base text-app-text-3 mb-6 text-center">
            Move {applicantName} to a new pipeline stage.
          </Text>

          <View className="space-y-3 mb-6">
            {availableStages.map((stage) => (
              <TouchableOpacity
                key={stage}
                className="py-3 px-4 rounded-xl border border-app-border-2 items-center mb-3"
                onPress={() => onConfirm(stage)}
              >
                <Text className="text-base font-semibold text-app-slate-1">
                  {stage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="py-3 rounded-xl bg-app-gray-1 items-center"
            onPress={onClose}
          >
            <Text className="text-base font-semibold text-app-slate-1">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
