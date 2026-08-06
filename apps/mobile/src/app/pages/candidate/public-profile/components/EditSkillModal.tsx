import { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSearchSkills } from '../../../../../hooks/useSearchSkills';
import { createCandidateSkill } from '../../../../../api/candidate';
import { COLORS } from '@/app/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';

export default function EditSkillModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [skillName, setSkillName] = useState('');
  const [saving, setSaving] = useState(false);
  const { results, loading, search } = useSearchSkills();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setSkillName('');
      return;
    }
  }, [visible]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!skillName.trim()) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      void search(skillName.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [skillName, search]);

  async function handleSave(skillToAdd?: string) {
    const trimmed = (skillToAdd || skillName).trim();
    if (!trimmed) {
      return;
    }

    try {
      setSaving(true);
      await createCandidateSkill({ title: trimmed });
      onSaved?.();
      onClose();
    } catch (err) {
      Alert.alert('Save failed', 'Could not add skill.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAwareView className="flex-1 items-center justify-end bg-black/40">
        <SafeAreaView
          edges={['bottom']}
          className="w-full max-h-[50%] rounded-t-2xl bg-white p-4"
        >
          <Text className="mb-4 text-lg font-semibold">Add Skill</Text>

          <TextInput
            value={skillName}
            onChangeText={setSkillName}
            placeholder="Enter a new skill"
            className="rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            autoFocus
          />

          {skillName.trim().length > 0 && (
            <View className="mt-2 max-h-40 rounded-lg border border-app-border-unchecked">
              {loading && (
                <View className="items-center py-3">
                  <ActivityIndicator size="small" color={COLORS.primary2} />
                </View>
              )}
              {!loading && results.length === 0 && (
                <View className="px-3 py-3">
                  <Text className="text-sm text-app-gray-3">
                    No matching skills found. Press Save to add "
                    {skillName.trim()}".
                  </Text>
                </View>
              )}
              {!loading &&
                results.map((skill) => (
                  <TouchableOpacity
                    key={skill.id}
                    onPress={() => {
                      setSkillName(skill.name);
                      void handleSave(skill.name);
                    }}
                    className="border-b border-app-bg-disabled px-3 py-2.5"
                  >
                    <Text className="text-sm text-app-gray-2">
                      {skill.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          <View className="mt-4 flex-row gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 items-center justify-center rounded-lg border border-app-border-unchecked bg-white py-3"
            >
              <Text className="text-sm font-semibold text-app-gray-2">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void handleSave()}
              disabled={saving || !skillName.trim()}
              className="flex-1 items-center justify-center rounded-lg bg-app-primary-2 py-3"
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text className="text-sm font-semibold text-white">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAwareView>
    </Modal>
  );
}
