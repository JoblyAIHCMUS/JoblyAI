import React from 'react';
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
} from 'lucide-react-native';

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
  const isLastCv = currentData?.resumes?.length === 1;

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
      <View className="flex-1 items-center justify-center bg-black/40 px-4">
        <View
          className="w-full max-w-lg rounded-xl bg-white overflow-hidden"
          style={{ maxHeight: '85%' }}
        >
          <View className="flex flex-row items-center gap-3 px-5 py-4 border-b border-[#fecaca] bg-red-50">
            <AlertTriangle size={20} color="#dc2626" />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-[#1f2937]">
                Delete CV
              </Text>
              <Text className="text-sm text-[#6b7280]">{resumeName}</Text>
            </View>
          </View>

          <ScrollView
            className="px-5 py-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-4 pb-4">
              {hasAffectedData && (
                <View className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <Text className="text-sm font-semibold text-[#dc2626] mb-2">
                    Items that will be removed:
                  </Text>

                  {affectedExperiences.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Briefcase size={12} color="#dc2626" />
                        <Text className="text-xs font-medium text-[#dc2626]">
                          Experiences
                        </Text>
                      </View>
                      {affectedExperiences.map((exp, i) => (
                        <Text key={i} className="text-xs text-[#6b7280] ml-4">
                          • {exp.jobTitle || exp.companyName}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedEducations.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <GraduationCap size={12} color="#dc2626" />
                        <Text className="text-xs font-medium text-[#dc2626]">
                          Educations
                        </Text>
                      </View>
                      {affectedEducations.map((edu, i) => (
                        <Text key={i} className="text-xs text-[#6b7280] ml-4">
                          • {edu.school || edu.degree}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedSkills.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Code2 size={12} color="#dc2626" />
                        <Text className="text-xs font-medium text-[#dc2626]">
                          Skills
                        </Text>
                      </View>
                      <View className="flex flex-row flex-wrap gap-1 ml-4">
                        {affectedSkills.map((skill, i) => (
                          <Text key={i} className="text-xs text-[#6b7280]">
                            • {skill.title || skill.name}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {affectedCertificates.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Award size={12} color="#dc2626" />
                        <Text className="text-xs font-medium text-[#dc2626]">
                          Certificates
                        </Text>
                      </View>
                      {affectedCertificates.map((cert, i) => (
                        <Text key={i} className="text-xs text-[#6b7280] ml-4">
                          • {cert.name}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedContacts.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Phone size={12} color="#dc2626" />
                        <Text className="text-xs font-medium text-[#dc2626]">
                          Contacts
                        </Text>
                      </View>
                      {affectedContacts.map((c, i) => (
                        <Text key={i} className="text-xs text-[#6b7280] ml-4">
                          • {c.value}
                        </Text>
                      ))}
                    </View>
                  )}

                  {affectedSocials.length > 0 && (
                    <View className="mb-2">
                      <View className="flex flex-row items-center gap-1 mb-1">
                        <Share2 size={12} color="#dc2626" />
                        <Text className="text-xs font-medium text-[#dc2626]">
                          Social Links
                        </Text>
                      </View>
                      {affectedSocials.map((s, i) => (
                        <Text key={i} className="text-xs text-[#6b7280] ml-4">
                          • {s.platform}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {isLastCv && (
                <View className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <Text className="text-sm font-semibold text-[#d97706] mb-1">
                    This is your last CV
                  </Text>
                  <Text className="text-sm text-[#92400e]">
                    Deleting this will clear your profile data. You can
                    re-upload a new CV to restore.
                  </Text>
                </View>
              )}

              {!hasAffectedData && !isLastCv && (
                <View className="rounded-xl border border-[#e5e7eb] p-4">
                  <Text className="text-sm text-[#6b7280]">
                    No profile data will be affected by this deletion.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View className="px-5 py-4 border-t border-[#dbe1ee] flex flex-col gap-2">
            {!isLastCv && (
              <TouchableOpacity
                onPress={() => onConfirm(true)}
                disabled={isLoading}
                className="w-full py-3 rounded-md bg-green-500 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    Delete CV, Keep Profile Data
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onConfirm(false)}
              disabled={isLoading}
              className="w-full py-3 rounded-md bg-red-500 items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex flex-row items-center gap-2">
                  <Trash2 size={14} color="white" />
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
              className="w-full py-3 rounded-md border border-[#dbe1ee] items-center"
            >
              <Text className="text-sm text-[#6b7280]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default CvDeleteImpactModal;
