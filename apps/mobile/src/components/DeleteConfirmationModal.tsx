import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { COLORS } from '../app/constants/theme';

interface DeleteConfirmationModalProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({
  isVisible,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  onCancel,
  onConfirm,
  isDeleting = false,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
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
            {title}
          </Text>

          {/* Description */}
          <Text
            className="text-sm mb-6 text-center"
            style={{ color: COLORS.gray3 }}
          >
            {description}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-2 w-full">
            {/* Cancel Button */}
            <TouchableOpacity
              disabled={isDeleting}
              onPress={onCancel}
              className="flex-1 py-2 rounded-lg border bg-white"
              style={{ borderColor: COLORS.borderUnchecked }}
              activeOpacity={0.7}
            >
              <Text
                className="text-center font-medium"
                style={{ color: COLORS.gray2 }}
              >
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              disabled={isDeleting}
              onPress={onConfirm}
              className="flex-1 py-2 rounded-lg"
              style={{ backgroundColor: COLORS.tagRedText }}
              activeOpacity={0.7}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white font-semibold">
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
