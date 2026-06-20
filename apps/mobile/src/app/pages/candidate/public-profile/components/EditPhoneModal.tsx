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
      <View className="flex-1 items-center justify-end bg-black/40">
        <View className="w-full max-h-[50%] rounded-t-2xl bg-white p-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-lg font-semibold">
              Edit Phone Number
            </Text>

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              Phone Number
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 (555) 000-0000"
              className="mb-6 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
              keyboardType="phone-pad"
            />

            <View className="flex-row justify-end gap-2">
              <TouchableOpacity
                onPress={onClose}
                disabled={isPending}
                className="rounded-lg border border-[#d1d5db] px-4 py-2.5"
              >
                <Text className="text-sm font-medium text-[#374151]">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isPending}
                className="flex-1 flex-row items-center justify-center rounded-lg bg-[#4f46e5] px-4 py-2.5"
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
