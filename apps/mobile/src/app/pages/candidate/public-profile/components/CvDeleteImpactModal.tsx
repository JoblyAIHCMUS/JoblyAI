import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Trash2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Share2,
  Phone,
  User,
  FileX,
} from 'lucide-react-native';
import { usePreviewDeleteImpact } from '@/hooks/usePreviewDeleteImpact';
import { COLORS } from '@/app/constants/theme';

interface CvDeleteImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keepData: boolean) => Promise<void>;
  isLoading?: boolean;
  resumeName: string;
  resumeId: number;
  currentData: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  certificates?: any[];
  contacts?: any[];
  socials?: any[];
}

export function CvDeleteImpactModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  resumeName,
  resumeId,
  currentData,
  experiences = [],
  educations = [],
  skills = [],
  certificates = [],
  contacts = [],
  socials = [],
}: CvDeleteImpactModalProps) {
  const [previewBio, setPreviewBio] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);

  const { mutateAsync: previewDelete, isPending: previewLoading } =
    usePreviewDeleteImpact();

  const isLastCv = currentData?.resumes?.length === 1;

  useEffect(() => {
    if (isOpen && resumeId && !isLastCv) {
      previewDelete(resumeId)
        .then((result) => {
          setPreviewBio(result.previewBio);
          setPreviewTitle(result.previewTitle);
        })
        .catch(() => {
          setPreviewBio(null);
          setPreviewTitle(null);
        });
    } else {
      setPreviewBio(null);
      setPreviewTitle(null);
    }
  }, [isOpen, resumeId, isLastCv, previewDelete]);

  const getAffectedItems = (items: any[]) => {
    return items.filter((item) => {
      const sourceIds = Array.isArray(item.sourceCvIds)
        ? item.sourceCvIds.map(String)
        : [];
      return sourceIds.includes(String(resumeId));
    });
  };

  const affectedExperiences = getAffectedItems(experiences);
  const affectedEducations = getAffectedItems(educations);
  const affectedSkills = getAffectedItems(skills);
  const affectedCertificates = getAffectedItems(certificates);
  const affectedContacts = getAffectedItems(contacts);
  const affectedSocials = getAffectedItems(socials);

  const hasAffectedData =
    affectedExperiences.length > 0 ||
    affectedEducations.length > 0 ||
    affectedSkills.length > 0 ||
    affectedCertificates.length > 0 ||
    affectedContacts.length > 0 ||
    affectedSocials.length > 0;

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: COLORS.overlay }}
      >
        <View
          className="w-full max-w-lg rounded-xl bg-white overflow-hidden"
          style={{ maxHeight: '85%' }}
        >
          <View className="flex flex-row items-center gap-3 px-5 py-4 border-b border-app-tag-red-bg bg-app-tag-red-bg">
            <AlertTriangle size={20} color={COLORS.tagRedText} />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-app-dark-text">
                Delete CV
              </Text>
              <Text className="text-sm text-app-gray-3">{resumeName}</Text>
            </View>
          </View>

          <ScrollView
            className="px-5 py-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-4 pb-4">
              {hasAffectedData && (
                <View className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <Text className="text-sm font-semibold text-app-tag-red-text mb-2">
                    Items that will be removed:
                  </Text>

                  {affectedExperiences.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Briefcase size={12} color={COLORS.tagRedText} />
                        <Text className="text-xs font-medium text-app-tag-red-text">
                          Experiences
                        </Text>
                      </View>
                      {affectedExperiences.map((exp, i) => (
                        <Text key={i} className="text-xs text-app-gray-3 ml-4">
                          • {exp.jobTitle || exp.companyName}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedEducations.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <GraduationCap size={12} color={COLORS.tagRedText} />
                        <Text className="text-xs font-medium text-app-tag-red-text">
                          Educations
                        </Text>
                      </View>
                      {affectedEducations.map((edu, i) => (
                        <Text key={i} className="text-xs text-app-gray-3 ml-4">
                          • {edu.school || edu.degree}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedSkills.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Code2 size={12} color={COLORS.tagRedText} />
                        <Text className="text-xs font-medium text-app-tag-red-text">
                          Skills
                        </Text>
                      </View>
                      <View className="flex flex-row flex-wrap gap-1 ml-4">
                        {affectedSkills.map((skill, i) => (
                          <Text key={i} className="text-xs text-app-gray-3">
                            • {skill.title || skill.name}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {affectedCertificates.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Award size={12} color={COLORS.tagRedText} />
                        <Text className="text-xs font-medium text-app-tag-red-text">
                          Certificates
                        </Text>
                      </View>
                      {affectedCertificates.map((cert, i) => (
                        <Text key={i} className="text-xs text-app-gray-3 ml-4">
                          • {cert.name}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedContacts.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Phone size={12} color={COLORS.tagRedText} />
                        <Text className="text-xs font-medium text-app-tag-red-text">
                          Contacts
                        </Text>
                      </View>
                      {affectedContacts.map((c, i) => (
                        <Text key={i} className="text-xs text-app-gray-3 ml-4">
                          • {c.value}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedSocials.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Share2 size={12} color={COLORS.tagRedText} />
                        <Text className="text-xs font-medium text-app-tag-red-text">
                          Social Links
                        </Text>
                      </View>
                      {affectedSocials.map((s, i) => (
                        <Text key={i} className="text-xs text-app-gray-3 ml-4">
                          • {s.platform}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {!isLastCv && (previewBio || previewTitle) && (
                <View className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <Text
                    className="text-sm font-semibold mb-2"
                    style={{ color: COLORS.warningText }}
                  >
                    Regenerated Profile Data:
                  </Text>
                  {previewTitle && (
                    <View className="mb-2">
                      <Text
                        className="text-xs font-medium"
                        style={{ color: COLORS.warningDark }}
                      >
                        New Title:
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: COLORS.warningDarker }}
                      >
                        {previewTitle}
                      </Text>
                    </View>
                  )}
                  {previewBio && (
                    <View>
                      <Text
                        className="text-xs font-medium"
                        style={{ color: COLORS.warningDark }}
                      >
                        New Bio:
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: COLORS.warningDarker }}
                      >
                        {previewBio}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {isLastCv && (
                <View className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <Text
                    className="text-sm font-semibold mb-1"
                    style={{ color: COLORS.warningText }}
                  >
                    This is your last CV
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: COLORS.warningDark }}
                  >
                    Deleting this will clear your profile data. You can
                    re-upload a new CV to restore.
                  </Text>
                </View>
              )}

              {!hasAffectedData && !isLastCv && (
                <View className="rounded-xl border border-app-gray-1 p-4">
                  <Text className="text-sm text-app-gray-3">
                    No profile data will be affected by this deletion.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View className="px-5 py-4 border-t border-app-border-light flex flex-col gap-2">
            {!isLastCv && (
              <TouchableOpacity
                onPress={() => onConfirm(true)}
                disabled={isLoading || previewLoading}
                className="w-full py-3 rounded-md bg-app-green-1 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    Delete CV, Keep Profile Data
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onConfirm(false)}
              disabled={isLoading || previewLoading}
              className="w-full py-3 rounded-md bg-app-red-1 items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <View className="flex flex-row items-center gap-2">
                  <Trash2 size={14} color={COLORS.white} />
                  <Text className="text-sm font-semibold text-white">
                    {isLastCv
                      ? 'Delete Everything'
                      : 'Delete CV & All Sourced Data'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              className="w-full py-3 rounded-md border border-app-border-light items-center"
            >
              <Text className="text-sm text-app-gray-3">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default CvDeleteImpactModal;
