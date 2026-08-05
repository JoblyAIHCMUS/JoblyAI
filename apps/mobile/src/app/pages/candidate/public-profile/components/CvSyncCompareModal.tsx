import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Check,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Share2,
  Phone,
  User,
  Info,
} from 'lucide-react-native';
import { COLORS } from '@/app/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardDismissView } from '@/components/KeyboardDismissView';

interface CvSyncCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: any;
  newData: any;
  onSync: (draftData: any) => Promise<void>;
  onExtract?: () => void;
  isLoading?: boolean;
  isSynced?: boolean;
}

type SyncStatus = 'EXISTING' | 'MATCHED' | 'NEW';

function getSyncStatus(current: any[], newItem: any, key: string): SyncStatus {
  if (!current?.length) return 'NEW';
  const exists = current.some((item) => {
    if (key === 'bio') return true;
    if (key === 'skills') {
      const itemName =
        typeof item === 'string' ? item : item.name || item.title || '';
      const newItemName =
        typeof newItem === 'string'
          ? newItem
          : newItem?.name || newItem?.title || '';
      return itemName?.toLowerCase() === newItemName?.toLowerCase();
    }
    if (key === 'experiences' || key === 'educations') {
      return (
        item.jobTitle?.toLowerCase() === newItem?.jobTitle?.toLowerCase() ||
        item.school?.toLowerCase() === newItem?.school?.toLowerCase()
      );
    }
    return item.name?.toLowerCase() === newItem?.name?.toLowerCase();
  });
  return exists ? 'MATCHED' : 'NEW';
}

function StatusBadge({ status }: { status: SyncStatus }) {
  const config = {
    EXISTING: { bg: COLORS.bgDisabled, text: COLORS.gray3, label: 'Existing' },
    MATCHED: {
      bg: COLORS.badgeGreen,
      text: COLORS.successDark,
      label: 'Matched',
    },
    NEW: { bg: COLORS.bgSelected, text: COLORS.infoText, label: 'New' },
  };
  const c = config[status];
  return (
    <View className="px-2 py-0.5 rounded" style={{ backgroundColor: c.bg }}>
      <Text className="text-[10px] font-medium" style={{ color: c.text }}>
        {c.label}
      </Text>
    </View>
  );
}

export function CvSyncCompareModal({
  isOpen,
  onClose,
  currentData,
  newData,
  onSync,
  onExtract,
  isLoading = false,
  isSynced = false,
}: CvSyncCompareModalProps) {
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    if (newData) setDraft({ ...newData });
  }, [newData]);

  const handleSync = async () => {
    try {
      await onSync(draft);
    } catch (e) {
      console.error('Sync failed:', e);
    }
  };

  if (!isOpen) return null;

  const sections = [
    { key: 'bio', icon: User, label: 'Bio & Title' },
    { key: 'experiences', icon: Briefcase, label: 'Experiences' },
    { key: 'educations', icon: GraduationCap, label: 'Educations' },
    { key: 'skills', icon: Code2, label: 'Skills' },
    { key: 'certificates', icon: Award, label: 'Certificates' },
    { key: 'contacts', icon: Phone, label: 'Contacts' },
    { key: 'socials', icon: Share2, label: 'Social Links' },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <KeyboardDismissView className="flex-1">
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
          <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-app-border-light">
            <View className="flex flex-row items-center gap-2">
              <Info size={20} color={COLORS.primary2} />
              <Text className="text-lg font-semibold text-app-dark-text">
                Sync Resume Data
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={COLORS.gray3} />
            </TouchableOpacity>
          </View>

          {isSynced && (
            <View className="px-5 py-2 bg-green-50 border-b border-green-100">
              <Text className="text-sm text-green-700">
                This resume is synced to your profile.
              </Text>
            </View>
          )}

          {!draft ? (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator size="large" color={COLORS.primary2} />
              <Text className="mt-3 text-sm text-app-gray-3">
                Loading extracted data...
              </Text>
              {onExtract && (
                <TouchableOpacity
                  onPress={onExtract}
                  className="mt-4 px-4 py-2 rounded-md bg-app-primary-2"
                >
                  <Text className="text-sm text-white font-medium">
                    Extract Data
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <ScrollView
                className="flex-1 px-5 py-4"
                showsVerticalScrollIndicator={false}
              >
                <View className="gap-4 pb-4">
                  {sections.map(({ key, icon: Icon, label }) => {
                    const sectionData = draft[key];
                    const currentSectionData = currentData?.[key];

                    return (
                      <View
                        key={key}
                        className="rounded-xl border border-app-gray-1 overflow-hidden"
                      >
                        <View className="flex flex-row items-center gap-2 px-4 py-3 bg-app-bg-input border-b border-app-gray-1">
                          <Icon size={16} color={COLORS.primary2} />
                          <Text className="text-sm font-semibold text-app-dark-text">
                            {label}
                          </Text>
                          <StatusBadge
                            status={getSyncStatus(
                              currentSectionData,
                              sectionData,
                              key
                            )}
                          />
                        </View>

                        <View className="px-4 py-3">
                          {key === 'bio' && (
                            <View className="gap-2">
                              <Text className="text-xs text-app-gray-3">
                                Title
                              </Text>
                              <TextInput
                                value={draft.title || ''}
                                onChangeText={(t) =>
                                  setDraft((p: any) => ({ ...p, title: t }))
                                }
                                className="border border-app-gray-1 rounded-md px-3 py-2 text-sm"
                                placeholder="Professional title"
                              />
                              <Text className="text-xs text-app-gray-3 mt-2">
                                Bio
                              </Text>
                              <TextInput
                                value={draft.bio || ''}
                                onChangeText={(t) =>
                                  setDraft((p: any) => ({ ...p, bio: t }))
                                }
                                className="border border-app-gray-1 rounded-md px-3 py-2 text-sm"
                                multiline
                                numberOfLines={3}
                                placeholder="Professional summary"
                              />
                            </View>
                          )}

                          {key === 'skills' && (
                            <View className="flex flex-row flex-wrap gap-2">
                              {Array.isArray(sectionData) &&
                              sectionData.length > 0 ? (
                                sectionData.map((skill: any, i: number) => (
                                  <View
                                    key={i}
                                    className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
                                  >
                                    <Text className="text-xs text-blue-700">
                                      {typeof skill === 'string'
                                        ? skill
                                        : skill.name || JSON.stringify(skill)}
                                      {typeof skill === 'object' && skill.years
                                        ? ` (${skill.years}y)`
                                        : ''}
                                      {typeof skill === 'object' && skill.level
                                        ? ` · ${skill.level}`
                                        : ''}
                                    </Text>
                                  </View>
                                ))
                              ) : (
                                <Text className="text-sm text-app-gray-3">
                                  No skills extracted
                                </Text>
                              )}
                            </View>
                          )}

                          {(key === 'experiences' ||
                            key === 'educations' ||
                            key === 'certificates') && (
                            <View className="gap-2">
                              {Array.isArray(sectionData) &&
                              sectionData.length > 0 ? (
                                sectionData.map((item: any, i: number) => (
                                  <View
                                    key={i}
                                    className="p-3 rounded-lg bg-app-bg-input border border-app-gray-1"
                                  >
                                    <Text className="text-sm font-medium text-app-dark-text">
                                      {item.jobTitle ||
                                        item.school ||
                                        item.name ||
                                        'Untitled'}
                                    </Text>
                                    <Text className="text-xs text-app-gray-3 mt-1">
                                      {item.companyName ||
                                        item.degree ||
                                        item.issuer ||
                                        ''}
                                    </Text>
                                    {(item.startDate || item.issueDate) && (
                                      <Text className="text-xs text-app-text-placeholder mt-0.5">
                                        {item.startDate || item.issueDate}
                                        {item.endDate
                                          ? ` - ${item.endDate}`
                                          : item.expiryDate
                                          ? ` · Expires ${item.expiryDate}`
                                          : ''}
                                      </Text>
                                    )}
                                  </View>
                                ))
                              ) : (
                                <Text className="text-sm text-app-gray-3">
                                  No items extracted
                                </Text>
                              )}
                            </View>
                          )}

                          {(key === 'contacts' || key === 'socials') && (
                            <View className="gap-2">
                              {Array.isArray(sectionData) &&
                              sectionData.length > 0 ? (
                                sectionData.map((item: any, i: number) => (
                                  <View
                                    key={i}
                                    className="p-3 rounded-lg bg-app-bg-input border border-app-gray-1"
                                  >
                                    <Text className="text-sm font-medium text-app-dark-text">
                                      {item.type || item.platform || 'Contact'}
                                    </Text>
                                    <Text className="text-xs text-app-gray-3 mt-1">
                                      {item.value || item.url || ''}
                                    </Text>
                                  </View>
                                ))
                              ) : (
                                <Text className="text-sm text-app-gray-3">
                                  No items extracted
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              <View className="px-5 py-4 border-t border-app-border-light">
                <TouchableOpacity
                  onPress={handleSync}
                  disabled={isLoading}
                  className="w-full py-3 rounded-md bg-app-primary-2 items-center"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <View className="flex flex-row items-center gap-2">
                      <Check size={16} color={COLORS.white} />
                      <Text className="text-sm font-semibold text-white">
                        Sync Profile
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </KeyboardDismissView>
    </Modal>
  );
}

export default CvSyncCompareModal;
