import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useCreateDownloadUrl } from '../../../../../../hooks/useCreateDownloadUrl';

interface ApplicantResumePanelProps {
  fileKey: string;
  fileName?: string;
}

export function ApplicantResumePanel({
  fileKey,
  fileName = 'Resume',
}: ApplicantResumePanelProps) {
  const { fetchDownloadUrl, loading } = useCreateDownloadUrl({
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : 'Failed to load resume';
      Toast.show({ type: 'error', text1: 'Resume', text2: message });
    },
  });

  const viewResume = useCallback(() => {
    if (!fileKey) {
      Toast.show({
        type: 'error',
        text1: 'Resume',
        text2: 'No resume file is attached.',
      });
      return;
    }
    router.push({
      pathname: '/pages/candidate/pdf-viewer',
      params: { fileKey, fileName },
    });
  }, [fileKey, fileName]);

  const downloadResume = useCallback(async () => {
    if (!fileKey) {
      Toast.show({
        type: 'error',
        text1: 'Resume',
        text2: 'No resume file is attached.',
      });
      return;
    }
    try {
      const { downloadUrl } = await fetchDownloadUrl({ fileKey });
      const supported = await Linking.canOpenURL(downloadUrl);
      if (!supported) {
        Toast.show({
          type: 'error',
          text1: 'Resume',
          text2: 'Cannot open resume on this device.',
        });
        return;
      }
      await Linking.openURL(downloadUrl);
    } catch {
      // Error already shown via onError.
    }
  }, [fileKey, fetchDownloadUrl]);

  return (
    <View className="rounded-2xl border border-app-border-2 bg-white p-4">
      <Text className="text-lg font-semibold text-app-slate-1 mb-1">
        Candidate CV/Resume
      </Text>
      <Text className="text-sm text-app-text-3 mb-4">
        View or download the candidate's resume in PDF format.
      </Text>

      <View className="rounded-xl border border-app-border-3 bg-app-slate-gray p-6 items-center justify-center min-h-[120px] mb-4">
        {loading ? (
          <ActivityIndicator size="large" color="#4640DE" />
        ) : (
          <Text className="text-sm text-app-text-3 text-center">
            Tap a button below to view or download the resume.
          </Text>
        )}
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={viewResume}
          disabled={loading || !fileKey}
          activeOpacity={0.7}
          className="flex-1 py-3 rounded-xl bg-app-primary-1 items-center"
          style={{ opacity: loading || !fileKey ? 0.5 : 1 }}
        >
          <Text className="text-sm font-semibold text-white">View Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={downloadResume}
          disabled={loading || !fileKey}
          activeOpacity={0.7}
          className="flex-1 py-3 rounded-xl border border-app-border-2 bg-app-slate-gray items-center"
          style={{ opacity: loading || !fileKey ? 0.5 : 1 }}
        >
          <Text className="text-sm font-semibold text-app-slate-1">
            Download Resume
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
