import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS } from '@/app/constants/theme';

export interface ResumeChoice {
  id: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ResumeSectionProps {
  resumes: ResumeChoice[];
  selectedResumeId: number | null;
  selectedResume?: ResumeChoice | null;
  onSelect: (resumeId: number) => void;
  onDelete: (resumeId: number) => void;
  onUpload: () => void;
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  deletingResume: boolean;
  candidateProfileError: string | null;
  canUploadNewResume: boolean;
  maxResumes: number;
}

const formatResumeSize = (size?: number) => {
  if (!size) return '';
  const megabytes = size / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }
  const kilobytes = size / 1024;
  return `${Math.max(1, Math.round(kilobytes))} KB`;
};

const formatResumeDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function ResumeSection({
  resumes,
  selectedResumeId,
  selectedResume,
  onSelect,
  onDelete,
  onUpload,
  loading,
  uploading,
  uploadProgress,
  deletingResume,
  candidateProfileError,
  canUploadNewResume,
  maxResumes,
}: ResumeSectionProps) {
  return (
    <View>
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-app-dark-text">
          Use your recent resumes
        </Text>
        {selectedResume && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/pages/candidate/pdf-viewer',
                params: {
                  fileKey: selectedResume.fileKey,
                  fileName: selectedResume.fileName,
                },
              })
            }
          >
            <Text className="text-sm font-medium text-app-primary-2">View</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Resume List */}
      <View className="gap-3">
        {loading ? (
          <View className="rounded-lg border border-app-gray-1 bg-app-bg-input px-4 py-3">
            <Text className="text-sm text-app-gray-3">
              Loading your recent resumes...
            </Text>
          </View>
        ) : resumes.length > 0 ? (
          resumes.map((resume, index) => {
            const isSelected = resume.id === selectedResumeId;
            return (
              <TouchableOpacity
                key={resume.id}
                onPress={() => onSelect(resume.id)}
                className={`flex-row items-center justify-between rounded-lg border p-3 ${
                  isSelected
                    ? 'border-app-primary-2 bg-app-bg-selected'
                    : 'border-app-gray-1 bg-white'
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="flex-1 text-sm font-semibold text-app-dark-text"
                      numberOfLines={1}
                    >
                      {resume.fileName}
                    </Text>
                    {index === 0 && (
                      <View className="rounded-full bg-indigo-100 px-2 py-0.5">
                        <Text className="text-[10px] font-semibold uppercase text-indigo-700">
                          Latest
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="mt-1 text-xs text-app-gray-3">
                    {[
                      formatResumeDate(resume.updatedAt || resume.createdAt),
                      resume.fileType,
                      formatResumeSize(resume.fileSize),
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <View
                    className={`rounded-full px-3 py-1 ${
                      isSelected ? 'bg-app-primary-2' : 'bg-app-bg-disabled'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-white' : 'text-app-gray-3'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onDelete(resume.id)}
                    disabled={deletingResume || uploading}
                    className="h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50"
                  >
                    <Trash2 size={16} color={COLORS.tagRedText} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="rounded-lg border border-app-gray-1 bg-app-bg-input px-4 py-3">
            <Text className="text-sm text-app-gray-3">
              No uploaded resumes yet.
            </Text>
          </View>
        )}
      </View>

      {/* Upload Section */}
      <View className="mt-4">
        <Text className="mb-2 text-sm font-semibold text-app-dark-text">
          Attach a new resume
        </Text>
        <TouchableOpacity
          onPress={onUpload}
          disabled={!canUploadNewResume || uploading}
          className={`items-center rounded-lg border-2 border-dashed px-4 py-4 ${
            canUploadNewResume
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-app-gray-1 bg-app-bg-disabled'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              canUploadNewResume ? 'text-app-dark-text' : 'text-app-gray-3'
            }`}
          >
            {canUploadNewResume ? 'Attach Resume/CV' : 'Resume limit reached'}
          </Text>
        </TouchableOpacity>
        <Text className="mt-2 text-xs text-app-gray-3">
          You can store up to {maxResumes} resumes.
        </Text>
      </View>

      {/* Upload Progress */}
      {uploading && (
        <View className="mt-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-xs text-app-gray-3">Uploading...</Text>
            <Text className="text-xs text-app-gray-3">
              {Math.round(uploadProgress)}%
            </Text>
          </View>
          <View className="h-2 w-full overflow-hidden rounded-full bg-app-gray-1">
            <View
              className="h-full rounded-full bg-app-primary-2"
              style={{ width: `${uploadProgress}%` }}
            />
          </View>
        </View>
      )}

      {/* Selected Resume Confirmation */}
      {selectedResume && (
        <Text className="mt-3 text-xs text-green-600">
          ✓ Resume ready: {selectedResume.fileName}
        </Text>
      )}

      {/* Error */}
      {candidateProfileError && (
        <Text className="mt-3 text-xs text-amber-700">
          Could not load your resume history, so the latest uploaded file will
          be used.
        </Text>
      )}
    </View>
  );
}
