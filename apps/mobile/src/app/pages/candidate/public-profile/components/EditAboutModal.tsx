import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  createCandidateAbout,
  updateCandidateAbout,
} from '../../../../../api/candidate';
import { COLORS } from '@/app/constants/theme';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';

export default function EditAboutModal({
  visible,
  onClose,
  aboutId,
  initialBio,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  aboutId?: number;
  initialBio?: string;
  onSaved?: () => void;
}) {
  const [bio, setBio] = useState(initialBio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setBio(initialBio || '');
    }
  }, [visible, initialBio]);

  async function handleSave() {
    try {
      setSaving(true);
      if (aboutId) {
        await updateCandidateAbout({ id: aboutId, bio });
      } else {
        await createCandidateAbout({ bio });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      Alert.alert('Save failed', 'Could not save your about section.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAwareView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: COLORS.overlay }}
      >
        <View className="w-full rounded-lg bg-white p-4">
          <Text className="mb-4 text-lg font-semibold">About Me</Text>

          <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
            Biography
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={6}
            className="mb-4 h-40 rounded border border-app-border-unchecked px-3 py-2.5 text-sm"
          />

          <View className="flex-row justify-end gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="mr-2 items-center justify-center rounded border border-app-border-unchecked bg-white px-4 py-2"
            >
              <Text className="text-app-gray-2">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="items-center justify-center rounded bg-app-primary-2 px-4 py-2"
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text className="text-white">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareView>
    </Modal>
  );
}
