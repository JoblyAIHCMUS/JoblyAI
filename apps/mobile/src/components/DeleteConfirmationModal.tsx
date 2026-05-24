import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface DeleteConfirmationModalProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({
  isVisible,
  title = 'Delete Job Posting',
  description = 'Are you sure you want to delete this job posting? This action cannot be undone.',
  onCancel,
  onConfirm,
  isDeleting = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/30 justify-center items-center">
        <View className="bg-white rounded-3xl w-5/6 max-w-sm px-6 py-8 shadow-lg items-center">
          {/* Alert Icon */}
          <View className="w-12 h-12 rounded-full bg-[#FEE2E2] items-center justify-center mb-4">
            <AlertCircle size={24} color="#DC2626" strokeWidth={2} />
          </View>

          {/* Title */}
          <Text className="text-lg font-semibold text-[#111827] mb-2 text-center">
            {title}
          </Text>

          {/* Description */}
          <Text className="text-sm text-[#6B7280] mb-6 text-center">
            {description}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-2 w-full">
            {/* Cancel Button */}
            <TouchableOpacity
              disabled={isDeleting}
              onPress={onCancel}
              className="flex-1 py-2 rounded-lg border border-[#D1D5DB] bg-white"
              activeOpacity={0.7}
            >
              <Text className="text-center text-[#374151] font-medium">
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              disabled={isDeleting}
              onPress={onConfirm}
              className="flex-1 py-2 rounded-lg bg-[#DC2626]"
              activeOpacity={0.7}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white font-semibold">
                  Delete
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
