import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { ApplicantStatus } from '../app/pages/employer/jobs/components/ApplicantsTab';
import { COLORS } from '../app/constants/theme';

interface ConfirmStageChangeModalProps {
  isVisible: boolean;
  applicantName: string;
  currentStage: ApplicantStatus;
  newStage: ApplicantStatus;
  onCancel: () => void;
  onConfirm: () => void;
  isUpdating?: boolean;
}

export const ConfirmStageChangeModal: React.FC<
  ConfirmStageChangeModalProps
> = ({
  isVisible,
  applicantName,
  currentStage,
  newStage,
  onCancel,
  onConfirm,
  isUpdating = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: COLORS.overlay }}
      >
        <View className="bg-white rounded-3xl w-5/6 max-w-sm px-6 py-8 shadow-lg items-center">
          {/* Alert Icon */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.tagRedBg }}
          >
            <AlertCircle size={24} color={COLORS.tagRedText} strokeWidth={2} />
          </View>

          {/* Title */}
          <Text
            className="text-lg font-semibold mb-2 text-center"
            style={{ color: COLORS.darkText }}
          >
            Change Stage
          </Text>

          {/* Description */}
          <Text
            className="text-sm mb-6 text-center"
            style={{ color: COLORS.gray3 }}
          >
            Move {applicantName} from {currentStage} to {newStage}? This action
            cannot be undone.
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-2 w-full">
            {/* Cancel Button */}
            <TouchableOpacity
              disabled={isUpdating}
              onPress={onCancel}
              className="flex-1 py-2 rounded-lg border bg-white"
              style={{ borderColor: COLORS.borderUnchecked }}
              activeOpacity={0.7}
            >
              <Text
                className="text-center font-medium"
                style={{ color: COLORS.gray2 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              disabled={isUpdating}
              onPress={onConfirm}
              className="flex-1 py-2 rounded-lg"
              style={{ backgroundColor: COLORS.tagRedText }}
              activeOpacity={0.7}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white font-semibold">
                  Confirm
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
