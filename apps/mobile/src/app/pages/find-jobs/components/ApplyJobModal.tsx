'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import { COLORS } from '@/app/constants/theme';
import { useApplyToJob } from '@/hooks/useApplyToJob';
import { useCreateResume } from '@/hooks/useCreateResume';
import { useDeleteResume } from '@/hooks/useDeleteResume';
import { useUploadFile } from '@/hooks/useUploadFile';
import { getCandidateProfile } from '@/api/candidate';
import { ResumeSection, type ResumeChoice } from './ResumeSection';
import type { JobPosting } from '@/types/job';
import type { CandidateResume } from '@/types/candidate';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_RESUMES = 5;

interface ApplyJobModalProps {
  visible: boolean;
  onClose: () => void;
  job: JobPosting;
  onSuccess?: () => void;
}

export default function ApplyJobModal({
  visible,
  onClose,
  job,
  onSuccess,
}: ApplyJobModalProps) {
  const [resumeOptions, setResumeOptions] = useState<ResumeChoice[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(false);

  const { mutate: applyToJob, isPending: isSubmitting } = useApplyToJob();
  const {
    uploadToS3,
    loading: uploading,
    progress: uploadProgress,
  } = useUploadFile();
  const { createResumeRecord, loading: creatingResume } = useCreateResume();
  const { deleteResumeRecord, loading: deletingResume } = useDeleteResume();

  const isUploading = uploading || creatingResume;
  const selectedResume =
    resumeOptions.find((r) => r.id === selectedResumeId) ?? null;
  const canUploadNewResume =
    !loadingResumes && resumeOptions.length < MAX_RESUMES;

  const loadResumes = useCallback(async () => {
    setLoadingResumes(true);
    try {
      const profile = await getCandidateProfile();
      const sorted = (profile.resumes || [])
        .slice()
        .sort((a: CandidateResume, b: CandidateResume) => {
          const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return bTime - aTime;
        })
        .map((r: CandidateResume) => ({
          id: r.id,
          fileName: r.fileName,
          fileKey: r.fileKey,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          fileSize: r.fileSize,
          isDefault: r.isDefault,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));

      setResumeOptions(sorted);
      const defaultId =
        sorted.find((r: ResumeChoice) => r.isDefault)?.id ?? null;
      setSelectedResumeId(defaultId ?? sorted[0]?.id ?? null);
    } catch (error) {
      console.error('Failed to load resumes', error);
      setResumeOptions([]);
    } finally {
      setLoadingResumes(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setResumeOptions([]);
      setSelectedResumeId(null);
      loadResumes();
    }
  }, [visible, loadResumes]);

  const handleFileUpload = async () => {
    if (!canUploadNewResume) {
      Toast.show({
        type: 'error',
        text1: 'Resume limit reached',
        text2: 'You can store up to 5 resumes.',
      });
      return;
    }

    try {
      const results = await DocumentPicker.pick({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });

      if (!results || results.length === 0) return;

      const file = results[0];

      const uploadResult = await uploadToS3(
        {
          uri: file.uri,
          name: file.name || 'resume.pdf',
          type: file.type || 'application/pdf',
        } as any,
        'resumes'
      );

      await createResumeRecord({
        fileKey: uploadResult.fileKey,
        fileName: file.name || 'resume.pdf',
        fileType: file.type || 'application/pdf',
        fileSize: file.size || 0,
      });

      await loadResumes();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload resume';
      Toast.show({ type: 'error', text1: 'Upload failed', text2: message });
    }
  };

  const handleDeleteResume = (resumeId: number) => {
    const target = resumeOptions.find((r) => r.id === resumeId);
    if (target) {
      Alert.alert(
        'Delete resume',
        `Delete "${target.fileName}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => confirmDeleteResume(target),
          },
        ]
      );
    }
  };

  const confirmDeleteResume = async (target: ResumeChoice) => {
    try {
      await deleteResumeRecord(target.id);
      const remaining = resumeOptions.filter((r) => r.id !== target.id);
      setResumeOptions(remaining);
      if (selectedResumeId === target.id) {
        setSelectedResumeId(remaining[0]?.id ?? null);
      }
      Toast.show({
        type: 'success',
        text1: 'Resume deleted',
        text2: `"${target.fileName}" has been deleted.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete resume';
      Toast.show({ type: 'error', text1: 'Delete failed', text2: message });
    }
  };

  const handleSubmit = () => {
    if (!selectedResume?.id) {
      Toast.show({
        type: 'error',
        text1: 'Resume required',
        text2: 'Please select or upload a resume.',
      });
      return;
    }

    applyToJob(
      { jobId: job.id, resumeId: selectedResume.id },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Application submitted',
            text2: 'Your application has been submitted successfully!',
          });
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
        },
        onError: (error: any) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to submit application';
          Toast.show({
            type: 'error',
            text1: 'Submission failed',
            text2: message,
          });
        },
      }
    );
  };

  const employmentTypeLabel =
    {
      FULL_TIME: 'Full-Time',
      PART_TIME: 'Part-Time',
      INTERNSHIP: 'Internship',
      CONTRACT: 'Contract',
      FREELANCE: 'Freelance',
    }[job.type] || job.type;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 items-center justify-end bg-black/40">
        <SafeAreaView
          edges={['bottom']}
          className="w-full max-h-[90%] rounded-t-2xl bg-white px-4 pb-4"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-app-gray-1 py-3">
            <Text className="text-lg font-bold text-app-dark-text">
              Submit Application
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Job Header */}
            <View className="flex-row items-start gap-3 border-b border-app-gray-1 py-4">
              {job.company.logoUrl ? (
                <Image
                  source={{ uri: job.company.logoUrl }}
                  className="h-16 w-16 rounded-lg"
                  resizeMode="contain"
                />
              ) : null}
              <View className="flex-1">
                <Text className="text-lg font-semibold text-app-dark-text">
                  {job.title}
                </Text>
                <Text className="mt-1 text-sm text-app-gray-3">
                  {job.company.name || 'Company'}
                  {job.location ? ` • ${job.location}` : ''}
                  {` • ${employmentTypeLabel}`}
                </Text>
              </View>
            </View>

            {/* Form Title */}
            <View className="py-4">
              <Text className="text-lg font-semibold text-app-dark-text">
                Submit your application
              </Text>
              <Text className="mt-1 text-sm text-app-gray-3">
                The following information will only be shared with{' '}
                {job.company.name || 'the company'}
              </Text>
            </View>

            {/* Resume Section */}
            <View className="py-4">
              <ResumeSection
                resumes={resumeOptions}
                selectedResumeId={selectedResumeId}
                selectedResume={selectedResume}
                onSelect={setSelectedResumeId}
                onDelete={handleDeleteResume}
                onUpload={handleFileUpload}
                loading={loadingResumes}
                uploading={isUploading}
                uploadProgress={uploadProgress}
                deletingResume={deletingResume}
                candidateProfileError={null}
                canUploadNewResume={canUploadNewResume}
                maxResumes={MAX_RESUMES}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selectedResume || isSubmitting}
              className={`mb-4 rounded-lg py-3 ${
                !selectedResume || isSubmitting
                  ? 'bg-app-bg-disabled'
                  : 'bg-app-primary-2'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  className={`text-center font-semibold ${
                    !selectedResume || isSubmitting
                      ? 'text-app-text-placeholder'
                      : 'text-white'
                  }`}
                >
                  Submit Application
                </Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text className="mb-4 text-xs text-app-gray-3">
              By sending the request you confirm that you accept our Terms of
              Service and Privacy Policy.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
