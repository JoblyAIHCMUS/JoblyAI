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
import { createCertificate } from '../../../../../api/candidate';
import { COLORS } from '@/app/constants/theme';

export default function EditCertificateModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !issuer.trim()) {
      Alert.alert(
        'Validation',
        'Certificate name and issuing organization are required.'
      );
      return;
    }

    try {
      setSaving(true);
      await createCertificate({
        name: name.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate
          ? `${issueDate}T00:00:00.000Z`
          : new Date().toISOString(),
        expiryDate:
          hasExpiry && expiryDate ? `${expiryDate}T00:00:00.000Z` : undefined,
        credentialId: credentialId.trim() || undefined,
        url: url.trim() || undefined,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      Alert.alert('Save failed', 'Could not add certificate.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        className="flex-1 items-center justify-end"
        style={{ backgroundColor: COLORS.overlay }}
      >
        <View className="w-full max-h-[90%] rounded-t-2xl bg-white p-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-lg font-semibold">Add Certificate</Text>

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Certificate Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. AWS Certified Solutions Architect"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Issuing Organization <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={issuer}
              onChangeText={setIssuer}
              placeholder="e.g. Amazon Web Services"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Issue Date <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={issueDate}
              onChangeText={setIssueDate}
              placeholder="YYYY-MM-DD"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Expiry Date {hasExpiry && <Text className="text-red-500">*</Text>}
            </Text>
            <TextInput
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder={hasExpiry ? 'YYYY-MM-DD' : 'Does not expire'}
              editable={hasExpiry}
              className={`mb-2 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm ${
                !hasExpiry ? 'bg-app-bg-input text-app-text-placeholder' : ''
              }`}
            />

            <View className="mb-4 flex-row items-center gap-2">
              <Switch
                value={hasExpiry}
                onValueChange={(value) => {
                  setHasExpiry(value);
                  if (!value) setExpiryDate('');
                }}
                trackColor={{
                  false: COLORS.borderUnchecked,
                  true: COLORS.indigoTrack,
                }}
                thumbColor={hasExpiry ? COLORS.primary2 : COLORS.white}
              />
              <Text className="text-sm text-app-gray-2">
                This credential has an expiration date
              </Text>
            </View>

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Credential ID
            </Text>
            <TextInput
              value={credentialId}
              onChangeText={setCredentialId}
              placeholder="e.g. AWS-SEC-12345"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
            />

            <Text className="mb-1.5 text-sm font-semibold text-app-gray-2">
              Credential URL
            </Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
              className="mb-4 rounded-lg border border-app-border-unchecked px-3 py-2.5 text-sm"
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
                  <Text className="text-sm font-semibold text-white">
                    Save Certificate
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
