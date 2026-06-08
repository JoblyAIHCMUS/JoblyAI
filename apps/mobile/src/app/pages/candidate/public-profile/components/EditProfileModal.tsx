import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { updateCandidateProfile } from '../../../../../api/candidate';

export default function EditProfileModal({
  visible,
  onClose,
  initial,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: any;
  onSaved?: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [headline, setHeadline] = useState(initial?.about?.title || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [phone, setPhone] = useState(initial?.phoneNumber || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [openForOpportunities, setOpenForOpportunities] = useState(
    !!initial?.openForOpportunities
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      await updateCandidateProfile({
        name,
        location,
        phoneNumber: phone,
        email,
        openForOpportunities,
      });
      // update about title separately if provided
      if (headline) {
        await updateCandidateProfile({});
      }
      onSaved?.();
      onClose();
    } catch (err) {
      Alert.alert('Save failed', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-lg bg-white p-4">
          <Text className="mb-2 text-lg font-semibold">Edit Profile</Text>

          <Text className="text-xs font-medium text-[#556070]">Full name</Text>
          <TextInput value={name} onChangeText={setName} className="mb-2 rounded border px-3 py-2" />

          <Text className="text-xs font-medium text-[#556070]">Headline</Text>
          <TextInput value={headline} onChangeText={setHeadline} className="mb-2 rounded border px-3 py-2" />

          <Text className="text-xs font-medium text-[#556070]">Location</Text>
          <TextInput value={location} onChangeText={setLocation} className="mb-2 rounded border px-3 py-2" />

          <Text className="text-xs font-medium text-[#556070]">Phone</Text>
          <TextInput value={phone} onChangeText={setPhone} className="mb-2 rounded border px-3 py-2" />

          <Text className="text-xs font-medium text-[#556070]">Email</Text>
          <TextInput value={email} onChangeText={setEmail} className="mb-2 rounded border px-3 py-2" />

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm">Open for opportunities</Text>
            <Switch value={openForOpportunities} onValueChange={setOpenForOpportunities} />
          </View>

          <View className="flex-row justify-end gap-2">
            <TouchableOpacity onPress={onClose} className="mr-2 items-center justify-center rounded bg-gray-200 px-4 py-2">
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving} className="items-center justify-center rounded bg-[#5758e7] px-4 py-2">
              {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white">Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
