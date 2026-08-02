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
import { createEducation } from '../../../../../api/candidate';
import { COLORS } from '@/app/constants/theme';

const DEGREE_OPTIONS = [
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'ASSOCIATE', label: 'Associate' },
  { value: 'BACHELOR', label: "Bachelor's" },
  { value: 'MASTER', label: "Master's" },
  { value: 'PHD', label: 'PhD' },
  { value: 'OTHER', label: 'Other' },
];

export default function EditEducationModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDegreePicker, setShowDegreePicker] = useState(false);

  function normalizeGpaInput(value: string): string {
    const sanitized = value.replace(/,/g, '.').replace(/[^\d.]/g, '');
    if (!sanitized) return '';

    let nextValue = '';
    if (!sanitized.includes('.')) {
      const digits = sanitized.slice(0, 3);
      if (digits.length === 1) {
        nextValue = digits;
      } else {
        nextValue = `${digits[0]}.${digits.slice(1, 3)}`;
      }
    } else {
      const [integerRaw = '', ...decimalParts] = sanitized.split('.');
      const integerPart = integerRaw.slice(0, 1) || '0';
      const decimalPart = decimalParts.join('').slice(0, 2);
      nextValue = `${integerPart}.${decimalPart}`;
    }

    const gpaPattern = /^(?:[0-3](?:\.\d{0,2})?|4(?:\.0{0,2})?)$/;
    return gpaPattern.test(nextValue) ? nextValue : '';
  }

  async function handleSave() {
    if (!school.trim()) {
      Alert.alert('Validation', 'School is required.');
      return;
    }

    try {
      setSaving(true);
      const normalizedGpa = grade ? normalizeGpaInput(grade) : '';
      await createEducation({
        school: school.trim(),
        degree: degree || undefined,
        fieldOfStudy: fieldOfStudy.trim() || undefined,
        startDate: startDate
          ? `${startDate}T00:00:00.000Z`
          : new Date().toISOString(),
        endDate: isCurrent
          ? undefined
          : endDate
          ? `${endDate}T00:00:00.000Z`
          : undefined,
        grade: normalizedGpa || undefined,
        description: description.trim() || undefined,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      Alert.alert('Save failed', 'Could not add education.');
    } finally {
      setSaving(false);
    }
  }

  const selectedDegreeLabel =
    DEGREE_OPTIONS.find((d) => d.value === degree)?.label || 'Select degree';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 items-center justify-end bg-black/40">
        <View className="w-full max-h-[90%] rounded-t-2xl bg-white p-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-lg font-semibold">Add Education</Text>

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              School <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={school}
              onChangeText={setSchool}
              placeholder="School"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Degree <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowDegreePicker(!showDegreePicker)}
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5"
            >
              <Text className="text-sm text-app-gray-2">
                {selectedDegreeLabel}
              </Text>
            </TouchableOpacity>
            {showDegreePicker && (
              <View className="mb-4 rounded-lg border border-app-border-unchecked bg-white">
                {DEGREE_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    onPress={() => {
                      setDegree(d.value);
                      setShowDegreePicker(false);
                    }}
                    className={`border-b border-app-bg-disabled px-3 py-2.5 ${
                      degree === d.value ? 'bg-app-bg-selected' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        degree === d.value
                          ? 'font-semibold text-app-primary-2'
                          : 'text-app-gray-2'
                      }`}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Field of Study
            </Text>
            <TextInput
              value={fieldOfStudy}
              onChangeText={setFieldOfStudy}
              placeholder="Field of Study"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Start Date <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              End Date {!isCurrent && <Text className="text-red-500">*</Text>}
            </Text>
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder={isCurrent ? 'Present' : 'YYYY-MM-DD'}
              editable={!isCurrent}
              className={`mb-2 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm ${
                isCurrent ? 'bg-app-bg-input text-app-text-placeholder' : ''
              }`}
            />

            <View className="mb-4 flex-row items-center gap-2">
              <Switch
                value={isCurrent}
                onValueChange={(value) => {
                  setIsCurrent(value);
                  if (value) setEndDate('');
                }}
                trackColor={{
                  false: COLORS.borderUnchecked,
                  true: COLORS.indigoTrack,
                }}
                thumbColor={isCurrent ? COLORS.primary2 : COLORS.white}
              />
              <Text className="text-sm text-app-gray-2">
                Currently studying here
              </Text>
            </View>

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Grade (GPA)
            </Text>
            <TextInput
              value={grade}
              onChangeText={(text) => {
                const normalized = normalizeGpaInput(text);
                if (text === '' || normalized) {
                  setGrade(text);
                }
              }}
              placeholder="GPA (0.00 - 4.00)"
              keyboardType="decimal-pad"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              multiline
              numberOfLines={4}
              className="mb-4 h-28 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 items-center justify-center rounded-lg border border-app-border-unchecked bg-white py-3"
              >
                <Text className="text-sm font-semibold text-app-gray-2">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-1 items-center justify-center rounded-lg bg-app-primary-2 py-3"
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
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
