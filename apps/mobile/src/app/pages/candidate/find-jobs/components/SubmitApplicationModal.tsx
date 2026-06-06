import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { getCandidateResumes } from '../../../../../api/candidate';
import { useDeleteResume } from '../../../../../hooks/useDeleteResume';
import { useCreateApplication } from '../../../../../hooks/useCreateApplication';
import type { CandidateResume } from '../../../../../types/candidate';
import type { JobPosting } from '../../../../../types/job';

interface SubmitApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPosting;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface ResumeChoice extends CandidateResume {
  fileName: string;
  fileUrl: string;
}

const MAX_RESUMES = 5;

export const SubmitApplicationModal: React.FC<SubmitApplicationModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess,
  onError,
}) => {
  const [applicationSubmitError, setApplicationSubmitError] = useState<
    string | null
  >(null);
  const [applicationSubmitSuccess, setApplicationSubmitSuccess] = useState<
    string | null
  >(null);
  const [resumeOptions, setResumeOptions] = useState<ResumeChoice[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(false);

  const { deleteResumeRecord, loading: deletingResume } = useDeleteResume({
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete resume';
      setApplicationSubmitError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const { submitApplication, loading: applicationLoading } =
    useCreateApplication({
      onSuccess: (data) => {
        const successMsg = `Application submitted successfully for ${job.title}`;
        setApplicationSubmitSuccess(successMsg);
        onSuccess?.(successMsg);
        setApplicationSubmitError(null);
        setTimeout(() => {
          onClose();
          setApplicationSubmitSuccess(null);
        }, 2000);
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to submit application';
        setApplicationSubmitError(errorMessage);
        onError?.(errorMessage);
      },
    });

  const isSubmitting = applicationLoading;
  const selectedResume = resumeOptions.find(
    (resume) => resume.id === selectedResumeId
  );
  const canUploadNewResume =
    !loadingResumes && resumeOptions.length < MAX_RESUMES;

  useEffect(() => {
    if (isOpen) {
      setApplicationSubmitError(null);
      setApplicationSubmitSuccess(null);
      setResumeOptions([]);
      setSelectedResumeId(null);
      setLoadingResumes(true);

      const loadResumes = async () => {
        try {
          const resumes = await getCandidateResumes();
          const mappedResumes: ResumeChoice[] = resumes
            .slice()
            .sort((first, second) => {
              const firstTime = new Date(
                first.updatedAt || first.createdAt || 0
              ).getTime();
              const secondTime = new Date(
                second.updatedAt || second.createdAt || 0
              ).getTime();
              return secondTime - firstTime;
            })
            .map((resume) => ({
              id: resume.id,
              fileName: resume.fileName,
              fileUrl: resume.fileUrl,
              fileType: resume.fileType,
              fileSize: resume.fileSize,
              isDefault: resume.isDefault,
              createdAt: resume.createdAt,
              updatedAt: resume.updatedAt,
            }));

          setResumeOptions(mappedResumes);
          setSelectedResumeId(
            mappedResumes.find((resume) => resume.isDefault)?.id ??
              mappedResumes[0]?.id ??
              null
          );
        } catch (err) {
          console.error('Error loading resumes:', err);
        } finally {
          setLoadingResumes(false);
        }
      };

      loadResumes();
    }
  }, [isOpen]);

  const handleFileSelect = async () => {
    Alert.alert(
      'File Upload',
      'Note: File selection requires react-native-document-picker library.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteResume = async (resumeId: number) => {
    const resumeToDelete = resumeOptions.find(
      (resume) => resume.id === resumeId
    );
    if (!resumeToDelete) return;

    Alert.alert(
      'Delete Resume',
      `Are you sure you want to delete "${resumeToDelete.fileName}"?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setApplicationSubmitError(null);
              await deleteResumeRecord(resumeId);
              setResumeOptions((prev) => {
                const remaining = prev.filter(
                  (resume) => resume.id !== resumeId
                );

                if (selectedResumeId === resumeId) {
                  setSelectedResumeId(
                    remaining.find((resume) => resume.isDefault)?.id ??
                      remaining[0]?.id ??
                      null
                  );
                }

                return remaining;
              });
            } catch (err) {
              console.error('Error deleting resume:', err);
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async () => {
    if (isSubmitting) return;

    try {
      setApplicationSubmitError(null);

      if (!selectedResume) {
        const errorMsg = 'Please select a resume to apply';
        setApplicationSubmitError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      await submitApplication(job.id, selectedResume.id);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'An error occurred';
      setApplicationSubmitError(errorMsg);
      onError?.(errorMsg);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-[#e5e7eb] px-4 py-4">
          <View className="flex-1">
            <Text
              className="text-lg font-bold text-[#111827]"
              numberOfLines={1}
            >
              {job.title}
            </Text>
            <Text className="text-sm text-[#6b7280]">{job.company.name}</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
          {/* Error message */}
          {applicationSubmitError && (
            <View className="mx-4 mt-4 rounded-lg bg-red-50 p-3">
              <Text className="text-sm text-red-700">
                {applicationSubmitError}
              </Text>
            </View>
          )}

          {/* Success message */}
          {applicationSubmitSuccess && (
            <View className="mx-4 mt-4 rounded-lg bg-green-50 p-3">
              <Text className="text-sm text-green-700">
                {applicationSubmitSuccess}
              </Text>
            </View>
          )}

          {/* Loading state */}
          {loadingResumes && (
            <View className="mt-8 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-4 text-sm text-[#6b7280]">
                Loading resumes...
              </Text>
            </View>
          )}

          {!loadingResumes && (
            <>
              {/* Resume Selection */}
              <View className="px-4 py-4">
                <Text className="mb-3 text-lg font-semibold text-[#111827]">
                  Select Resume
                </Text>

                {resumeOptions.length > 0 ? (
                  <FlatList
                    data={resumeOptions}
                    scrollEnabled={false}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setSelectedResumeId(item.id)}
                        className={`mb-3 flex-row items-center gap-3 rounded-lg border-2 p-3 ${
                          selectedResumeId === item.id
                            ? 'border-[#4f46e5] bg-[#f0f1ff]'
                            : 'border-[#e5e7eb] bg-white'
                        }`}
                      >
                        <View className="flex-1">
                          <Text className="font-medium text-[#111827]">
                            {item.fileName}
                          </Text>
                          <Text className="text-xs text-[#6b7280]">
                            {(item.fileSize / 1024).toFixed(2)} KB
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteResume(item.id)}
                          className="p-2"
                        >
                          <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text className="text-sm text-[#6b7280]">
                    No resumes uploaded yet
                  </Text>
                )}

                {canUploadNewResume && (
                  <TouchableOpacity
                    onPress={handleFileSelect}
                    disabled={false}
                    className="mt-4 flex-row items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#d1d5db] bg-[#f9fafb] py-4"
                  >
                    <Plus size={20} color="#6b7280" />
                    <Text className="text-sm font-medium text-[#6b7280]">
                      Add Resume
                    </Text>
                  </TouchableOpacity>
                )}

                {resumeOptions.length >= MAX_RESUMES && (
                  <Text className="mt-2 text-xs text-[#ea580c]">
                    You can store up to {MAX_RESUMES} resumes
                  </Text>
                )}
              </View>

              {/* Job Details */}
              <View className="border-t border-[#e5e7eb] px-4 py-4">
                <Text className="mb-3 text-lg font-semibold text-[#111827]">
                  Job Details
                </Text>
                <View className="gap-3">
                  <View>
                    <Text className="text-xs text-[#6b7280]">Location</Text>
                    <Text className="text-sm font-medium text-[#111827]">
                      {job.location || 'Not specified'}
                      {job.remote && ' (Remote)'}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-[#6b7280]">Salary</Text>
                    <Text className="text-sm font-medium text-[#111827]">
                      {job.salaryMin || job.salaryMax
                        ? `$${
                            job.salaryMin
                              ? (job.salaryMin / 1000).toFixed(0) + 'k'
                              : ''
                          } ${job.salaryMin && job.salaryMax ? '—' : ''} ${
                            job.salaryMax
                              ? (job.salaryMax / 1000).toFixed(0) + 'k'
                              : ''
                          }`
                        : 'Not specified'}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View className="border-t border-[#e5e7eb] px-4 py-4">
          <TouchableOpacity
            onPress={handleFormSubmit}
            disabled={
              isSubmitting ||
              !selectedResume ||
              loadingResumes ||
              deletingResume
            }
            className={`rounded-lg py-4 ${
              isSubmitting ||
              !selectedResume ||
              loadingResumes ||
              deletingResume
                ? 'bg-[#d1d5db]'
                : 'bg-[#4f46e5]'
            }`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator size="small" color="white" />
                <Text className="font-semibold text-white">Submitting...</Text>
              </View>
            ) : (
              <Text className="text-center font-semibold text-white">
                Submit Application
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SubmitApplicationModal;
