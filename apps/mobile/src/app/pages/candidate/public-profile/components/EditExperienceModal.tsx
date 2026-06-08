import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { createExperience } from '../../../../../api/candidate';

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
];

export default function EditExperienceModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  async function handleSave() {
    if (!jobTitle.trim() || !companyName.trim()) {
      Alert.alert('Validation', 'Job title and company are required.');
      return;
    }

    try {
      setSaving(true);
      await createExperience({
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        type: employmentType,
        startDate: startDate ? `${startDate}T00:00:00.000Z` : new Date().toISOString(),
        endDate: isCurrent ? undefined : endDate ? `${endDate}T00:00:00.000Z` : undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      Alert.alert('Save failed', 'Could not add experience.');
    } finally {
      setSaving(false);
    }
  }

  const selectedTypeLabel =
    EMPLOYMENT_TYPES.find((t) => t.value === employmentType)?.label || 'Full-time';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 items-center justify-end bg-black/40">
        <View className="w-full max-h-[90%] rounded-t-2xl bg-white p-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-lg font-semibold">Add Experience</Text>

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              Job Title <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="e.g. Senior Software Engineer"
              className="mb-4 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              Company <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Google"
              className="mb-4 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              Employment Type <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowTypePicker(!showTypePicker)}
              className="mb-4 rounded-lg border border-[#d1d5db] px-3 py-2.5"
            >
              <Text className="text-sm text-[#374151]">{selectedTypeLabel}</Text>
            </TouchableOpacity>
            {showTypePicker && (
              <View className="mb-4 rounded-lg border border-[#d1d5db] bg-white">
                {EMPLOYMENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => {
                      setEmploymentType(type.value);
                      setShowTypePicker(false);
                    }}
                    className={`border-b border-[#f3f4f6] px-3 py-2.5 ${
                      employmentType === type.value ? 'bg-[#f3f5ff]' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        employmentType === type.value
                          ? 'font-semibold text-[#5758e7]'
                          : 'text-[#374151]'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              Start Date <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              className="mb-4 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              End Date {!isCurrent && <Text className="text-red-500">*</Text>}
            </Text>
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder={isCurrent ? 'Present' : 'YYYY-MM-DD'}
              editable={!isCurrent}
              className={`mb-2 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm ${
                isCurrent ? 'bg-[#f9fafb] text-[#9ca3af]' : ''
              }`}
            />

            <View className="mb-4 flex-row items-center gap-2">
              <Switch
                value={isCurrent}
                onValueChange={(value) => {
                  setIsCurrent(value);
                  if (value) setEndDate('');
                }}
                trackColor={{ false: '#d1d5db', true: '#818cf8' }}
                thumbColor={isCurrent ? '#5758e7' : '#f4f3f4'}
              />
              <Text className="text-sm text-[#374151]">I currently work here</Text>
            </View>

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              Location
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Ho Chi Minh City, Vietnam"
              className="mb-4 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-[#374151]">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe your responsibilities and achievements..."
              multiline
              numberOfLines={4}
              className="mb-4 h-28 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 items-center justify-center rounded-lg border border-[#d1d5db] bg-white py-3"
              >
                <Text className="text-sm font-semibold text-[#374151]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-1 items-center justify-center rounded-lg bg-[#5758e7] py-3"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
