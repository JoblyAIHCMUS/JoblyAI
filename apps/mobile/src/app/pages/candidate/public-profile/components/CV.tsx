import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Pdf from 'react-native-pdf';
import {
  Download,
  Trash2,
  Star,
  Code2,
  Eye,
  X,
  Upload,
  AlertCircle,
  ArrowLeftRight,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import type { CandidateResume } from '@/types/candidate';
import type { ProcessingTasks } from '@/contexts/AiProcessingContext';
import { useCreateDownloadUrl } from '@/hooks/useCreateDownloadUrl';
import { COLORS } from '@/app/constants/theme';

interface CVProps {
  resumes: CandidateResume[];
  selectedResumeId?: number | null;
  onCVChange: (file: {
    fileKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => Promise<void>;
  onSelectResume?: (resumeId: number) => Promise<void> | void;
  onDeleteResume?: (resumeId: number) => void;
  onTriggerParse?: (resumeId: number) => void;
  onSyncResume?: (resumeId: number, parsedData: any) => void;
  maxResumes?: number;
  isUploading?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  processingTasks?: ProcessingTasks;
  deletingResumeId?: number | null;
  uploadError?: string | null;
}

export function CV({
  resumes = [],
  selectedResumeId,
  onCVChange,
  onSelectResume,
  onDeleteResume,
  onTriggerParse,
  onSyncResume,
  maxResumes = 5,
  isUploading = false,
  isUpdating = false,
  isDeleting = false,
  processingTasks = {},
  deletingResumeId = null,
  uploadError = null,
}: CVProps) {
  const { fetchDownloadUrl: createDownloadUrl } = useCreateDownloadUrl();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');
  const [confirmDefaultOpen, setConfirmDefaultOpen] = useState(false);
  const [pendingDefaultId, setPendingDefaultId] = useState<number | null>(null);

  const resumeCount = resumes.length;
  const isAtMax = resumeCount >= maxResumes;
  const isBusy = isUploading || isUpdating || isDeleting;

  const sortedResumes = [...resumes].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault)
  );

  const handlePickFile = useCallback(async () => {
    try {
      const [file] = await DocumentPicker.pick({
        type: ['application/pdf'],
      });

      if (!file) return;
      if (file.size && file.size > 5 * 1024 * 1024) {
        Toast.show({
          type: 'error',
          text1: 'File too large',
          text2: 'PDF must be under 5MB',
        });
        return;
      }

      await onCVChange({
        fileKey: file.uri,
        fileName: file.name || 'resume.pdf',
        fileType: file.type || 'application/pdf',
        fileSize: file.size || 0,
      });
      setUploadOpen(false);
    } catch (err) {
      console.error('Failed to pick file:', err);
    }
  }, [onCVChange]);

  const handlePreview = useCallback(
    async (resume: CandidateResume) => {
      try {
        setPreviewName(resume.fileName);
        setPreviewOpen(true);
        setPreviewUri(null);

        const { downloadUrl } = await createDownloadUrl({
          fileKey: resume.fileKey,
        });
        const localUri = FileSystem.cacheDirectory + `resume_${resume.id}.pdf`;
        await FileSystem.downloadAsync(downloadUrl, localUri);
        setPreviewUri(localUri);
      } catch (err) {
        console.error('[CV] Preview failed:', err);
        Toast.show({ type: 'error', text1: 'Failed to load PDF' });
        setPreviewOpen(false);
      }
    },
    [createDownloadUrl]
  );

  const handleDownload = useCallback(async () => {
    if (!previewUri) return;
    try {
      await Sharing.shareAsync(previewUri, {
        mimeType: 'application/pdf',
        dialogTitle: previewName,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Download failed' });
    }
  }, [previewUri, previewName]);

  const handleOpenDefaultConfirm = (resumeId: number) => {
    if (isBusy) return;
    setPendingDefaultId(resumeId);
    setConfirmDefaultOpen(true);
  };

  const handleConfirmDefault = async () => {
    if (pendingDefaultId != null) {
      await onSelectResume?.(pendingDefaultId);
    }
    setConfirmDefaultOpen(false);
    setPendingDefaultId(null);
  };

  const handleSyncPress = useCallback(
    (resume: CandidateResume) => {
      if (!resume.parsedText || !onSyncResume) return;
      try {
        const parsedData = JSON.parse(resume.parsedText);
        onSyncResume(resume.id, parsedData);
      } catch {
        Toast.show({ type: 'error', text1: 'Failed to parse resume data' });
      }
    },
    [onSyncResume]
  );

  return (
    <View className="rounded-xl border border-app-border-light bg-white p-4 flex flex-col gap-3">
      <View className="flex flex-row items-center justify-between gap-3">
        <View className="flex flex-col">
          <Text className="text-lg font-semibold text-app-dark-text">
            CV/Resume
          </Text>
          {isAtMax && (
            <Text className="mt-1 text-xs text-app-primary-2">
              Maximum of {maxResumes} CVs reached.
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setUploadOpen(true)}
          disabled={isBusy || isAtMax}
          className={`px-4 py-2 rounded-md ${
            isBusy || isAtMax ? 'bg-gray-300' : 'bg-app-primary-2'
          }`}
        >
          <Text className="text-white text-sm font-semibold">Upload CV</Text>
        </TouchableOpacity>
      </View>

      {resumes.length > 0 && (
        <View className="flex flex-col gap-2">
          <Text className="text-xs text-app-gray-3">
            Stored CVs ({resumeCount}/{maxResumes})
          </Text>

          {sortedResumes.map((resume) => {
            const isActive = resume.isDefault;
            const isParsing = processingTasks[resume.id]?.parsing;
            const hasParseData =
              !!resume.parsedText &&
              Object.keys(JSON.parse(resume.parsedText || '{}')).length > 0;
            const canSync = hasParseData && !resume.isSyncedToProfile;

            return (
              <View
                key={resume.id}
                className={`rounded-lg border p-3 ${
                  isActive
                    ? 'border-app-primary-2 bg-app-bg-selected'
                    : 'border-app-border-light bg-white'
                }`}
              >
                <View className="flex flex-row items-center justify-between gap-2">
                  <TouchableOpacity
                    onPress={() => handlePreview(resume)}
                    className="flex-1"
                  >
                    <View className="flex flex-row items-center gap-2">
                      <Text
                        className="text-sm font-semibold text-app-dark-text"
                        numberOfLines={1}
                      >
                        {resume.fileName}
                      </Text>
                      {canSync && (
                        <View className="bg-amber-100 px-2 py-0.5 rounded">
                          <Text className="text-amber-800 text-[10px] font-medium">
                            Ready to Sync
                          </Text>
                        </View>
                      )}
                      {resume.isSyncedToProfile && (
                        <View className="bg-blue-100 px-2 py-0.5 rounded">
                          <Text className="text-blue-800 text-[10px] font-medium">
                            Synced
                          </Text>
                        </View>
                      )}
                    </View>
                    {isActive && (
                      <Text className="text-[10px] text-app-primary-2 mt-0.5">
                        Default
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-app-border-light">
                  <TouchableOpacity
                    onPress={() => handlePreview(resume)}
                    disabled={isBusy}
                    className="h-8 w-8 items-center justify-center rounded-md border border-app-border-light"
                  >
                    <Eye size={14} color={COLORS.gray3} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onTriggerParse?.(resume.id)}
                    disabled={isBusy || isParsing}
                    className={`h-8 w-8 items-center justify-center rounded-md border ${
                      hasParseData
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-app-border-light bg-gray-50'
                    }`}
                  >
                    {isParsing ? (
                      <ActivityIndicator size="small" color={COLORS.primary2} />
                    ) : (
                      <Code2
                        size={14}
                        color={hasParseData ? COLORS.warningText : COLORS.gray3}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSyncPress(resume)}
                    disabled={isBusy || !canSync}
                    className={`h-8 w-8 items-center justify-center rounded-md border ${
                      canSync
                        ? 'border-app-primary-2 bg-app-primary-2'
                        : 'border-app-border-light bg-gray-100'
                    }`}
                  >
                    <ArrowLeftRight
                      size={14}
                      color={canSync ? COLORS.white : COLORS.borderUnchecked}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenDefaultConfirm(resume.id)}
                    disabled={resume.isDefault || isBusy}
                    className={`h-8 w-8 items-center justify-center rounded-md border ${
                      resume.isDefault
                        ? 'border-app-border-light bg-gray-100'
                        : 'border-app-border-light'
                    }`}
                  >
                    <Star
                      size={14}
                      color={
                        resume.isDefault
                          ? COLORS.borderUnchecked
                          : COLORS.primary2
                      }
                      fill={
                        resume.isDefault
                          ? COLORS.borderUnchecked
                          : 'transparent'
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onDeleteResume?.(resume.id)}
                    disabled={deletingResumeId === resume.id || isUpdating}
                    className="h-8 w-8 items-center justify-center rounded-md border border-red-200"
                  >
                    {deletingResumeId === resume.id ? (
                      <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                      <Trash2 size={14} color={COLORS.error} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {uploadError && (
        <View className="flex flex-row items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle size={16} color={COLORS.error} />
          <Text className="text-sm text-red-700">{uploadError}</Text>
        </View>
      )}

      <Text className="text-xs text-app-gray-3">
        Upload your CV or resume in PDF format. This helps recruiters quickly
        review your qualifications.
      </Text>

      <Modal visible={uploadOpen} transparent animationType="slide">
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: COLORS.overlay }}
        >
          <View className="w-full rounded-xl bg-white p-5 gap-4">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-app-dark-text">
                Upload CV
              </Text>
              <TouchableOpacity onPress={() => setUploadOpen(false)}>
                <X size={20} color={COLORS.gray3} />
              </TouchableOpacity>
            </View>

            {isAtMax && (
              <Text className="text-sm text-app-primary-2">
                You already have {maxResumes} CVs. Delete one to upload a new
                CV.
              </Text>
            )}

            <TouchableOpacity
              onPress={handlePickFile}
              disabled={isBusy || isAtMax}
              className={`border-2 border-dashed rounded-xl p-8 items-center gap-3 ${
                isBusy || isAtMax
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-app-primary-2 bg-app-bg-selected'
              }`}
            >
              {isBusy ? (
                <ActivityIndicator size="large" color={COLORS.primary2} />
              ) : (
                <Upload size={32} color={COLORS.gray3} />
              )}
              <View className="items-center gap-1">
                <Text className="text-sm text-app-gray-3">
                  Tap to select a PDF
                </Text>
                <Text className="text-xs text-app-text-placeholder">
                  PDF only (max 5MB)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={previewOpen} transparent animationType="slide">
        <View className="flex-1 bg-white pt-12">
          <View className="flex flex-row items-center justify-between px-4 py-3 border-b border-app-border-light">
            <Text
              className="text-base font-semibold text-app-dark-text flex-1"
              numberOfLines={1}
            >
              {previewName}
            </Text>
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity
                onPress={handleDownload}
                disabled={!previewUri}
                className="h-9 w-9 items-center justify-center rounded-lg border border-app-border-light"
              >
                <Download size={18} color={COLORS.primary2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPreviewOpen(false);
                  setPreviewUri(null);
                }}
                className="h-9 w-9 items-center justify-center rounded-lg border border-app-border-light"
              >
                <X size={18} color={COLORS.gray3} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1">
            {previewUri ? (
              <Pdf
                source={{ uri: previewUri }}
                style={{ flex: 1 }}
                enablePaging={false}
                horizontal={false}
                spacing={10}
                fitPolicy={2}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.primary2} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={confirmDefaultOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-xl bg-white p-5 gap-4">
            <Text className="text-lg font-semibold text-app-dark-text">
              Set Default CV
            </Text>
            <Text className="text-sm text-app-gray-3">
              This CV will be used as your default resume for applications.
            </Text>
            <View className="flex flex-row justify-end gap-2">
              <TouchableOpacity
                onPress={() => {
                  setConfirmDefaultOpen(false);
                  setPendingDefaultId(null);
                }}
                disabled={isBusy}
                className="px-4 py-2 rounded-md border border-app-border-light"
              >
                <Text className="text-sm text-app-gray-3">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDefault}
                disabled={isBusy}
                className="px-4 py-2 rounded-md bg-app-primary-2"
              >
                <Text className="text-sm text-white font-medium">
                  Set default
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

CV.displayName = 'CV';
export default CV;
