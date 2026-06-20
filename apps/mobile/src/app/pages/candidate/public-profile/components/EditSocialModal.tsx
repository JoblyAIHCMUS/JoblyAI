import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Trash2, Pencil } from 'lucide-react-native';
import { useCreateSocial } from '../../../../../hooks/useCreateSocial';
import { useUpdateSocial } from '../../../../../hooks/useUpdateSocial';
import { useDeleteSocial } from '../../../../../hooks/useDeleteSocial';
import type { CandidateSocial } from '../../../../../types/candidate';

const PLATFORMS = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'DRIBBBLE', label: 'Dribbble' },
  { value: 'BEHANCE', label: 'Behance' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'OTHER', label: 'Other' },
];

interface EditSocialModalProps {
  visible: boolean;
  onClose: () => void;
  mode: 'add' | 'manage';
  social?: CandidateSocial | null;
  socials?: CandidateSocial[];
  onSaved: () => void;
}

export default function EditSocialModal({
  visible,
  onClose,
  mode: initialMode,
  social,
  socials = [],
  onSaved,
}: EditSocialModalProps) {
  const [view, setView] = useState<'list' | 'form'>(
    initialMode === 'manage' ? 'list' : 'form'
  );
  const [editingSocial, setEditingSocial] = useState<CandidateSocial | null>(
    social || null
  );

  const [platform, setPlatform] = useState(social?.platform || 'LINKEDIN');
  const [url, setUrl] = useState(social?.url || '');
  const [username, setUsername] = useState(social?.username || '');
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  const { mutateAsync: createSocial, isPending: isCreating } =
    useCreateSocial();
  const { mutateAsync: updateSocial, isPending: isUpdating } =
    useUpdateSocial();
  const { mutateAsync: deleteSocial, isPending: isDeleting } =
    useDeleteSocial();

  const isPending = isCreating || isUpdating || isDeleting;
  const selectedPlatform = PLATFORMS.find((p) => p.value === platform);
  const isEditing = !!editingSocial?.id;

  const resetForm = () => {
    setPlatform('LINKEDIN');
    setUrl('');
    setUsername('');
    setShowPlatformPicker(false);
  };

  const openAddForm = () => {
    resetForm();
    setEditingSocial(null);
    setView('form');
  };

  const openEditForm = (s: CandidateSocial) => {
    setEditingSocial(s);
    setPlatform(s.platform);
    setUrl(s.url);
    setUsername(s.username || '');
    setShowPlatformPicker(false);
    setView('form');
  };

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'URL is required');
      return;
    }

    try {
      if (isEditing) {
        await updateSocial({
          id: editingSocial!.id,
          platform,
          url: url.trim(),
          username: username.trim() || undefined,
        });
      } else {
        await createSocial({
          platform,
          url: url.trim(),
          username: username.trim() || undefined,
        });
      }
      onSaved();
      onClose();
    } catch {
      // Error handled by hooks
    }
  };

  const handleDelete = (s: CandidateSocial) => {
    Alert.alert('Delete Social Link', `Delete ${s.platform}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSocial(s.id);
            onSaved();
          } catch {
            // Error handled by hook
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 items-center justify-end bg-black/40">
        <View className="w-full max-h-[90%] rounded-t-2xl bg-white p-4">
          {view === 'list' ? (
            <>
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold">Social Links</Text>
                <TouchableOpacity onPress={openAddForm}>
                  <Text className="text-sm font-semibold text-[#4f46e5]">
                    + Add New
                  </Text>
                </TouchableOpacity>
              </View>

              {socials.length === 0 ? (
                <Text className="py-8 text-center text-sm text-[#6b7280]">
                  No social links yet.
                </Text>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {socials.map((s, index) => (
                    <View key={s.id}>
                      <View className="flex-row items-center justify-between py-3">
                        <View className="flex-1">
                          <Text className="text-xs font-bold uppercase text-[#6b7280]">
                            {s.platform}
                          </Text>
                          <Text className="mt-1 text-sm text-[#4e5cf0]">
                            {s.url.replace(/^https?:\/\//, '')}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <TouchableOpacity onPress={() => openEditForm(s)}>
                            <Pencil size={18} color="#4f46e5" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(s)}>
                            <Trash2 size={18} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      {index < socials.length - 1 && (
                        <View className="h-px bg-[#dfe3f1]" />
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                onPress={onClose}
                className="mt-4 items-center rounded-lg border border-[#d1d5db] py-2.5"
              >
                <Text className="text-sm font-medium text-[#374151]">
                  Close
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold">
                  {isEditing ? 'Edit Social Link' : 'Add Social Link'}
                </Text>
                {initialMode === 'manage' && (
                  <TouchableOpacity onPress={() => setView('list')}>
                    <Text className="text-sm font-semibold text-[#4f46e5]">
                      ← Back
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
                Platform <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowPlatformPicker(!showPlatformPicker)}
                className="mb-4 rounded-lg border border-[#d1d5db] px-3 py-2.5"
              >
                <Text className="text-sm">
                  {selectedPlatform?.label || 'Select platform'}
                </Text>
              </TouchableOpacity>

              {showPlatformPicker && (
                <View className="mb-4 rounded-lg border border-[#d1d5db]">
                  {PLATFORMS.map((p) => (
                    <TouchableOpacity
                      key={p.value}
                      onPress={() => {
                        setPlatform(p.value);
                        setShowPlatformPicker(false);
                      }}
                      className={`border-b border-[#d1d5db] px-3 py-2.5 ${
                        platform === p.value ? 'bg-[#f3f4ff]' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          platform === p.value
                            ? 'font-semibold text-[#4f46e5]'
                            : 'text-[#374151]'
                        }`}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
                URL <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://..."
                className="mb-4 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
                keyboardType="url"
                autoCapitalize="none"
              />

              <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="@username"
                className="mb-6 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
                autoCapitalize="none"
              />

              <View className="flex-row gap-2">
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => handleDelete(editingSocial!)}
                    disabled={isPending}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5"
                  >
                    <Text className="text-sm font-semibold text-red-600">
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
                <View className="flex-1 flex-row justify-end gap-2">
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
                      <Text className="text-sm font-semibold text-white">
                        {isEditing ? 'Update' : 'Add'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
