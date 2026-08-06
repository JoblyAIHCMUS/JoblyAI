import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useUpdateProfile } from '../../../../../hooks/useUpdateProfile';
import { COLORS } from '@/app/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';

interface EditPhoneModalProps {
  visible: boolean;
  onClose: () => void;
  currentPhone: string;
  onSaved: () => void;
}

export default function EditPhoneModal({
  visible,
  onClose,
  currentPhone,
  onSaved,
}: EditPhoneModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone);
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  useEffect(() => {
    if (visible) {
      setPhoneNumber(currentPhone);
    }
  }, [visible, currentPhone]);

  const handleSave = async () => {
    try {
      await updateProfile({ phoneNumber: phoneNumber.trim() || undefined });
      onSaved();
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAwareView
        className="flex-1 items-center justify-end"
        style={{ backgroundColor: COLORS.overlay }}
      >
        <SafeAreaView
          edges={['bottom']}
          className="w-full max-h-[50%] rounded-t-2xl bg-white p-4 pb-8"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-lg font-semibold">
              Edit Phone Number
            </Text>

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Phone Number
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 (555) 000-0000"
              className="mb-6 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
              keyboardType="phone-pad"
            />

            <View className="flex-row justify-end gap-2">
              <TouchableOpacity
                onPress={onClose}
                disabled={isPending}
                className="rounded-lg border border-app-border-unchecked px-4 py-2.5"
              >
                <Text className="text-sm font-medium text-app-gray-2">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isPending}
                className="flex-1 flex-row items-center justify-center rounded-lg bg-app-primary-2 px-4 py-2.5"
              >
                {isPending ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text className="text-sm font-semibold text-white">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAwareView>
    </Modal>
  );
}
