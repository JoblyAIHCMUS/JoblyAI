import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeCheck, Mail, Menu, Pencil, Phone } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import {
  InstagramIcon,
  TwitterIcon,
} from '../../../components/shared/svgs/Icons';
import CandidateDashboardSidebar from '../dashboard/components/CandidateDashboardSidebar';
import EditAboutModal from './components/EditAboutModal';
import EditExperienceModal from './components/EditExperienceModal';
import EditEducationModal from './components/EditEducationModal';
import EditCertificateModal from './components/EditCertificateModal';
import EditSkillModal from './components/EditSkillModal';
import { CV } from './components/CV';
import { AiFeedbackModal } from './components/AiFeedbackModal';
import { CvSyncCompareModal } from './components/CvSyncCompareModal';
import { CvDeleteImpactModal } from './components/CvDeleteImpactModal';
import EditSocialModal from './components/EditSocialModal';
import EditPhoneModal from './components/EditPhoneModal';
import { useUpdateProfile } from '../../../../hooks/useUpdateProfile';
import {
  AiProcessingProvider,
  useAiProcessing,
} from '@/context/AiProcessingContext';
import { useGetCandidateProfile } from '../../../../hooks/useGetCandidateProfile';
import { getPresignedUploadUrl } from '../../../../api/candidate';
import { useUploadResume } from '@/hooks/useUploadResume';
import { useDeleteResume } from '@/hooks/useDeleteResume';
import { useSetDefaultResume } from '@/hooks/useSetDefaultResume';
import { useTriggerAiParse } from '@/hooks/useTriggerAiParse';
import { useTriggerAiScore } from '@/hooks/useTriggerAiScore';
import { useCommitResumeMerge } from '@/hooks/useCommitResumeMerge';
import { useCreateDownloadUrl } from '@/hooks/useCreateDownloadUrl';
import type {
  CandidateEducation,
  CandidateExperience,
  CandidateCertificate,
  CandidateProfileResponse,
  CandidateSocial,
} from '../../../../types/candidate';

function HeaderIcon({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="h-8 w-8 items-center justify-center rounded-full border border-[#dbe1ee] bg-white"
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-lg font-semibold tracking-[-0.2px] text-[#1f2937]">
        {title}
      </Text>
      {action}
    </View>
  );
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-xl border border-[#dbe1ee] bg-white ${className}`}
    >
      {children}
    </View>
  );
}

function SimpleHome() {
  return <View className="h-3 w-3 rounded-sm border border-[#1f2937]" />;
}

function SimpleBell() {
  return (
    <View className="relative h-3 w-3 rounded-t-full border border-[#1f2937]">
      <View className="absolute -bottom-1 left-1/2 h-0.5 w-1.5 -translate-x-1/2 rounded-full bg-[#1f2937]" />
    </View>
  );
}

function SimpleEdit() {
  return <Pencil size={12} color="#4f46e5" strokeWidth={2.4} />;
}

function SimpleLocation() {
  return (
    <View className="h-3 w-2 rounded-t-full rounded-b border border-[#667085]" />
  );
}

function SimpleFlag() {
  return <BadgeCheck size={14} color="#11a7a2" strokeWidth={2.2} />;
}

function SimpleMail() {
  return <Mail size={16} color="#667085" strokeWidth={2} />;
}

function SimplePhone() {
  return <Phone size={16} color="#667085" strokeWidth={2} />;
}

function SimplePlus() {
  return (
    <View className="items-center justify-center">
      <View className="h-2.5 w-0.5 rounded-full bg-[#4f46e5]" />
      <View className="absolute h-0.5 w-2.5 rounded-full bg-[#4f46e5]" />
    </View>
  );
}

function AvatarPhoto({ avatarUrl }: { avatarUrl?: string }) {
  const imageUri = avatarUrl?.trim() || 'https://i.pravatar.cc/240?img=12';

  return (
    <View className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-[#dbeafe] shadow-lg">
      <Image
        source={{ uri: imageUri }}
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
  );
}

function SectionAction({ onPress }: { onPress?: () => void }) {
  return (
    <HeaderIcon onPress={onPress}>
      <SimpleEdit />
    </HeaderIcon>
  );
}

function formatDate(value?: string): string {
  if (!value) return '';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function formatDateRange(startDate?: string, endDate?: string): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';

  if (!start && !endDate) return 'Date not specified';
  if (!start) return end;
  return `${start} - ${end}`;
}

function getDisplayName(profile?: CandidateProfileResponse): string {
  if (!profile) return 'Candidate';

  const full = profile.name?.trim();
  if (full) return full;

  const name = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (name) return name;

  return 'Candidate';
}

function ProfileContent() {
  const {
    processingTasks,
    triggerParse,
    triggerScore,
    onParsedSuccess,
    onScoredSuccess,
    reconcile,
  } = useAiProcessing();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditAboutOpen, setIsEditAboutOpen] = useState(false);
  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [isAddCertificateOpen, setIsAddCertificateOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialModalMode, setSocialModalMode] = useState<'add' | 'manage'>(
    'manage'
  );
  const [editingSocial, setEditingSocial] = useState<CandidateSocial | null>(
    null
  );
  const [isEditPhoneOpen, setIsEditPhoneOpen] = useState(false);

  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [deleteImpactModalOpen, setDeleteImpactModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncInProgressRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const {
    data: profile,
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetCandidateProfile();
  const { mutateAsync: uploadResume, isPending: isUploading } =
    useUploadResume();
  const { deleteResumeRecord: deleteResume, loading: isDeleting } =
    useDeleteResume();
  const { mutateAsync: setDefaultResume } = useSetDefaultResume();
  const { mutateAsync: triggerAiParse } = useTriggerAiParse();
  const { mutateAsync: triggerAiScore } = useTriggerAiScore();
  const { mutateAsync: commitResumeMerge } = useCommitResumeMerge();
  const { fetchDownloadUrl: createDownloadUrl } = useCreateDownloadUrl();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const startAiSyncPolling = useCallback(
    (resumeId: number) => {
      if (pollRef.current) clearInterval(pollRef.current);
      const attempt = async () => {
        try {
          const freshProfile = await refetch();
          const freshData = freshProfile?.data;
          const resume = freshData?.resumes?.find((r) => r.id === resumeId);
          if (!resume) return;
          const parsedRaw = (resume as any).parsedText;
          if (!parsedRaw) return;
          const parsedData = JSON.parse(parsedRaw);
          if (!parsedData || Object.keys(parsedData).length === 0) return;
          if (syncInProgressRef.current.has(resumeId)) return;
          syncInProgressRef.current.add(resumeId);
          if (pollRef.current) clearInterval(pollRef.current);
          onParsedSuccess(resumeId);
          Toast.show({ type: 'success', text1: 'CV parsed — ready to sync' });
          setActiveResumeId(resumeId);
          setSyncModalOpen(true);
        } catch {
          /* next tick will retry */
        }
      };
      pollRef.current = setInterval(attempt, 4000);
      setTimeout(attempt, 500);
    },
    [refetch, onParsedSuccess]
  );

  const startAiCompletionPolling = useCallback(
    (resumeId: number, type: 'parse' | 'score') => {
      if (pollRef.current) clearInterval(pollRef.current);
      const attempt = async () => {
        try {
          const freshProfile = await refetch();
          const freshData = freshProfile?.data;
          const resume = freshData?.resumes?.find((r) => r.id === resumeId);
          if (!resume) return;
          const done =
            type === 'parse' ? !!resume.parsedText : resume.aiScore !== null;
          if (done) {
            if (pollRef.current) clearInterval(pollRef.current);
            if (type === 'parse') onParsedSuccess(resumeId);
            else onScoredSuccess(resumeId);
            Toast.show({
              type: 'success',
              text1: type === 'parse' ? 'Data extracted' : 'Score ready',
            });
          }
        } catch {
          /* next tick will retry */
        }
      };
      pollRef.current = setInterval(attempt, 3000);
      setTimeout(attempt, 500);
    },
    [refetch, onParsedSuccess, onScoredSuccess]
  );

  useEffect(() => {
    if (profile?.resumes) reconcile(profile.resumes);
  }, [profile?.resumes, reconcile]);

  useEffect(() => {
    const defaultResumeId =
      profile?.resumes?.find((r) => r.isDefault)?.id ||
      profile?.resumes?.[0]?.id ||
      null;
    setSelectedResumeId(defaultResumeId);
  }, [profile?.resumes]);

  const displayName = useMemo(() => getDisplayName(profile), [profile]);
  const headline = profile?.about?.title?.trim() || 'Candidate';
  const location = profile?.location?.trim() || 'Location not specified';
  const aboutText =
    profile?.about?.bio?.trim() ||
    'Complete your profile in the web app to add your professional summary.';
  const experiences = profile?.experiences ?? [];
  const educations = profile?.educations ?? [];
  const certificates = profile?.certificates ?? [];
  const skills = profile?.skills ?? [];
  const contacts = profile?.contacts ?? [];
  const socials = profile?.socials ?? [];
  const email = profile?.email || 'Not provided';
  const phone = profile?.phoneNumber?.trim() || 'Not provided';

  const instagram = socials.find((social) =>
    social.platform.toLowerCase().includes('instagram')
  );
  const twitter = socials.find((social) =>
    social.platform.toLowerCase().includes('twitter')
  );

  const topExperiences = experiences.slice(0, 3);
  const topEducations = educations.slice(0, 3);

  const formatEmploymentType = (type?: string): string => {
    if (!type) return '';
    const map: Record<string, string> = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      INTERNSHIP: 'Internship',
      FREELANCE: 'Freelance',
      ONSITE: 'Onsite',
      REMOTE: 'Remote',
      HYBRID: 'Hybrid',
      OTHER: 'Other',
    };
    return map[type] || type.replace(/_/g, ' ').toLowerCase();
  };

  const handleCVUpload = async (file: {
    fileKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => {
    setUploadErrorMsg(null);
    try {
      if ((profile?.resumes?.length || 0) >= 5) {
        setUploadErrorMsg('You can store up to 5 resumes.');
        Toast.show({ type: 'error', text1: 'Maximum resumes reached' });
        return;
      }

      const { uploadUrl, fileKey } = await getPresignedUploadUrl(
        file.fileName,
        file.fileType
      );

      const uploadRes = await new Promise<{ status: number }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl, true);
          xhr.setRequestHeader('Content-Type', file.fileType);
          xhr.onload = () => resolve({ status: xhr.status });
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send({ uri: file.fileKey });
        }
      );
      if (uploadRes.status < 200 || uploadRes.status >= 300) {
        throw new Error(`S3 upload failed (${uploadRes.status})`);
      }
      console.log('[CV Upload] S3 upload success, fileKey:', fileKey);

      const newResume = await uploadResume({
        fileKey,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        isDefault: true,
      });
      if (newResume?.id) {
        triggerParse(newResume.id);
        triggerScore(newResume.id);
        triggerAiParse(newResume.id);
        triggerAiScore(newResume.id);
        startAiSyncPolling(newResume.id);
      }
      await refetch();
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Upload failed');
    }
  };

  const handleSelectResume = async (resumeId: number) => {
    setSelectedResumeId(resumeId);
    const selectedResume = profile?.resumes?.find((r) => r.id === resumeId);
    if (!selectedResume || selectedResume.isDefault) return;
    try {
      await setDefaultResume(resumeId);
      await refetch();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to set default CV' });
    }
  };

  const handleDeleteResume = (resumeId: number) => {
    setActiveResumeId(resumeId);
    setDeleteImpactModalOpen(true);
  };

  const handleConfirmDeleteResume = async (keepData: boolean) => {
    if (!activeResumeId) return;
    setDeletingResumeId(activeResumeId);
    try {
      await deleteResume({ resumeId: activeResumeId, keepData: true });
      await refetch();
      setDeleteImpactModalOpen(false);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to delete CV' });
    } finally {
      setDeletingResumeId(null);
    }
  };

  const handleTriggerParse = (resumeId: number) => {
    triggerParse(resumeId);
    triggerAiParse(resumeId)
      .then(() => {
        Toast.show({ type: 'info', text1: 'AI is extracting data...' });
        startAiCompletionPolling(resumeId, 'parse');
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Failed to start AI parsing' });
      });
  };

  const handleTriggerScore = (resumeId: number) => {
    triggerScore(resumeId);
    triggerAiScore(resumeId)
      .then(() => {
        Toast.show({ type: 'info', text1: 'AI is scoring resume...' });
        startAiCompletionPolling(resumeId, 'score');
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Failed to start AI scoring' });
      });
  };

  const handleSyncResume = async (draftData?: any) => {
    if (!activeResumeId) return;
    try {
      await commitResumeMerge({ resumeId: activeResumeId, data: draftData });
      await refetch();
      setSyncModalOpen(false);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to sync profile' });
    }
  };

  const handleToggleOpportunities = async () => {
    try {
      await updateProfile({
        openForOpportunities: !profile?.openForOpportunities,
      });
      await refetch();
      Toast.show({
        type: 'success',
        text1: profile?.openForOpportunities
          ? 'No longer open to opportunities'
          : 'Now open to opportunities',
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleOpenEditSocial = (social?: CandidateSocial) => {
    setEditingSocial(social || null);
    setSocialModalMode(social ? 'add' : 'manage');
    setIsSocialModalOpen(true);
  };

  const renderExperience = (experience: CandidateExperience) => {
    return (
      <View key={experience.id} className="flex-row gap-3 pb-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#1d9bf0]">
          <TwitterIcon />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold tracking-tight text-[#1f2535]">
            {experience.jobTitle}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Text className="text-sm font-semibold text-[#4d5465]">
              {experience.companyName}
            </Text>
            {!!experience.type && (
              <Text className="text-sm text-[#6b7280]">
                {' '}
                &middot; {formatEmploymentType(experience.type)}
              </Text>
            )}
          </View>
          <Text className="mt-1 text-sm text-[#6b7280]">
            {formatDateRange(experience.startDate, experience.endDate)}
          </Text>
          {!!experience.location && (
            <Text className="mt-0.5 text-sm text-[#6b7280]">
              {experience.location}
            </Text>
          )}
          {!!experience.description && (
            <Text className="mt-1.5 text-sm leading-5 text-[#57606d]">
              {experience.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEducation = (education: CandidateEducation) => {
    return (
      <View key={education.id} className="flex-row gap-3 pb-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#981b1e]">
          <Text className="text-xs font-bold text-white">
            {education.school.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold tracking-[-0.2px] text-[#1f2535]">
            {education.school}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Text className="text-sm font-semibold text-[#4d5465]">
              {[education.degree, education.fieldOfStudy]
                .filter(Boolean)
                .join(', ') || 'Education'}
            </Text>
            {!!education.grade && (
              <Text className="text-sm text-[#6b7280]">
                {' '}
                &middot; GPA: {education.grade}
              </Text>
            )}
          </View>
          <Text className="mt-1 text-sm text-[#6b7280]">
            {formatDateRange(education.startDate, education.endDate)}
          </Text>
          {!!education.description && (
            <Text className="mt-1.5 text-sm leading-5 text-[#57606d]">
              {education.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={screenOptions} />
      <StatusBar style="dark" />

      {isPending && !profile ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-sm font-medium text-[#4c5466]">
            Loading your profile...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => void refetch()}
            />
          }
        >
          <View className="px-3 pt-1">
            <View className="flex-row items-center justify-between pb-3">
              <View className="flex-row items-center gap-3">
                <HeaderIcon onPress={() => setIsSidebarOpen(true)}>
                  <Menu size={22} color="#25324b" />
                </HeaderIcon>
                <Text className="text-2xl font-semibold tracking-[-0.3px] text-[#111827]">
                  My Profile
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <HeaderIcon>
                  <SimpleHome />
                </HeaderIcon>
                <HeaderIcon>
                  <View>
                    <SimpleBell />
                    <View className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#ff5f5f]" />
                  </View>
                </HeaderIcon>
              </View>
            </View>
          </View>

          <View className="px-3">
            <View className="relative pt-14">
              <View className="absolute left-1/2 top-0 z-30 -ml-14">
                <AvatarPhoto avatarUrl={profile?.avatarUrl} />
              </View>
              <Card className="overflow-hidden">
                <View className="relative h-20 overflow-hidden bg-[#f6cbe0]">
                  <View className="absolute left-0 top-0 h-full w-2/5 bg-[#f8d7ea]" />
                  <View className="absolute left-1/3 top-0 h-20 w-20 rotate-[-22deg] bg-[#ebb5d5]" />
                  <View className="absolute right-0 top-0 h-full w-1/3 bg-[#80508a]" />
                  <View className="absolute right-12 top-0 h-full w-6 bg-[#a84f8d]" />
                  <View className="absolute right-16 top-1 h-3 w-16 rounded-full bg-[#a56aa4] opacity-35" />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="absolute right-3 top-2.5 h-7 w-7 items-center justify-center rounded-sm border border-white/60 bg-transparent"
                    onPress={() => setIsEditAboutOpen(true)}
                  >
                    <SimpleEdit />
                  </TouchableOpacity>
                </View>
                <View className="items-start px-3 pb-3 pt-18">
                  <Text className="text-2xl font-bold tracking-tight text-[#20263a]">
                    {displayName}
                  </Text>
                  <Text className="mt-1 text-sm font-medium text-[#6c7281]">
                    {headline}
                  </Text>
                  <View className="mt-1.5 flex-row items-center gap-2">
                    <SimpleLocation />
                    <Text className="text-sm font-medium text-[#5f6575]">
                      {location}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleToggleOpportunities}
                    className={`mt-2 rounded-sm px-3 py-2 ${
                      profile?.openForOpportunities
                        ? 'bg-[#d1f6ef]'
                        : 'bg-[#f3f4f6]'
                    }`}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <SimpleFlag />
                      <Text
                        className={`text-sm font-medium tracking-wide ${
                          profile?.openForOpportunities
                            ? 'text-[#11a7a2]'
                            : 'text-[#6b7280]'
                        }`}
                      >
                        {profile?.openForOpportunities
                          ? 'OPEN FOR OPPORTUNITIES'
                          : 'NOT OPEN TO NEW OPPORTUNITIES'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          </View>

          {error && (
            <View className="mt-4 px-3">
              <Card className="px-3 py-2.5 bg-[#fef2f2] border-[#fecaca]">
                <Text className="text-sm text-[#b91c1c]">
                  Failed to load profile from backend. Pull down to retry.
                </Text>
              </Card>
            </View>
          )}

          <View className="mt-5 px-3">
            <SectionHeader
              title="About Me"
              action={
                <SectionAction onPress={() => setIsEditAboutOpen(true)} />
              }
            />
            <Card className="px-3 py-2.5">
              <Text className="text-sm leading-5 tracking-tight text-[#4c5466]">
                {aboutText}
              </Text>
            </Card>
          </View>

          <View className="mt-5 px-3">
            <SectionHeader title="CV/Resume" />
            <CV
              resumes={profile?.resumes || []}
              selectedResumeId={selectedResumeId}
              onCVChange={handleCVUpload}
              onSelectResume={handleSelectResume}
              onDeleteResume={handleDeleteResume}
              onTriggerParse={handleTriggerParse}
              onTriggerScore={handleTriggerScore}
              onSyncResume={(resumeId, parsedData) => {
                setActiveResumeId(resumeId);
                setSyncModalOpen(true);
              }}
              maxResumes={5}
              isUploading={isUploading}
              isUpdating={false}
              isDeleting={isDeleting}
              processingTasks={processingTasks}
              deletingResumeId={deletingResumeId}
              uploadError={uploadErrorMsg}
            />
          </View>

          <View className="mt-5 px-3">
            <SectionHeader
              title="Experiences"
              action={
                <View className="flex-row items-center gap-2">
                  <HeaderIcon onPress={() => setIsAddExperienceOpen(true)}>
                    <SimplePlus />
                  </HeaderIcon>
                  <HeaderIcon onPress={() => setIsAddExperienceOpen(true)}>
                    <SimpleEdit />
                  </HeaderIcon>
                </View>
              }
            />
            <Card className="px-3 py-2.5">
              {topExperiences.length === 0 ? (
                <Text className="text-sm text-[#6b7280]">
                  No experience added yet.
                </Text>
              ) : (
                topExperiences.map((experience, index) => (
                  <View key={experience.id}>
                    {renderExperience(experience)}
                    {index < topExperiences.length - 1 && (
                      <View className="my-2.5 h-px bg-[#dfe3f1]" />
                    )}
                  </View>
                ))
              )}
              {experiences.length > topExperiences.length && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="mt-2.5 items-center"
                >
                  <Text className="text-xs font-bold text-[#5758e7]">
                    Show {experiences.length - topExperiences.length} more
                    experiences
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>

          <View className="mt-5 px-3">
            <SectionHeader
              title="Educations"
              action={
                <View className="flex-row items-center gap-2">
                  <HeaderIcon onPress={() => setIsAddEducationOpen(true)}>
                    <SimplePlus />
                  </HeaderIcon>
                  <HeaderIcon onPress={() => setIsAddEducationOpen(true)}>
                    <SimpleEdit />
                  </HeaderIcon>
                </View>
              }
            />
            <Card className="px-3 py-2.5">
              {topEducations.length === 0 ? (
                <Text className="text-sm text-[#6b7280]">
                  No education added yet.
                </Text>
              ) : (
                topEducations.map((education, index) => (
                  <View key={education.id}>
                    {renderEducation(education)}
                    {index < topEducations.length - 1 && (
                      <View className="my-2.5 h-px bg-[#dfe3f1]" />
                    )}
                  </View>
                ))
              )}
              {educations.length > topEducations.length && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="mt-2.5 items-center"
                >
                  <Text className="text-xs font-bold text-[#5758e7]">
                    Show {educations.length - topEducations.length} more
                    educations
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>

          <View className="mt-5 px-3">
            <SectionHeader
              title="Certifications & Licenses"
              action={
                <View className="flex-row items-center gap-2">
                  <HeaderIcon onPress={() => setIsAddCertificateOpen(true)}>
                    <SimplePlus />
                  </HeaderIcon>
                </View>
              }
            />
            <Card className="px-3 py-2.5">
              {certificates.length === 0 ? (
                <Text className="text-sm text-[#6b7280]">
                  No certifications added yet.
                </Text>
              ) : (
                certificates.slice(0, 3).map((cert, index) => (
                  <View key={cert.id}>
                    <View className="flex-row items-start gap-3 pb-2.5">
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6]">
                        <Text className="text-xs font-bold text-white">
                          {cert.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold tracking-tight text-[#1f2535]">
                          {cert.name}
                        </Text>
                        <Text className="mt-1 text-sm font-semibold text-[#4d5465]">
                          {cert.issuer}
                        </Text>
                        <Text className="mt-1 text-sm text-[#6b7280]">
                          Issued {formatDate(cert.issueDate)}
                          {cert.expiryDate
                            ? ` · Expires ${formatDate(cert.expiryDate)}`
                            : ''}
                        </Text>
                        {!!cert.credentialId && (
                          <Text className="mt-1 text-xs text-[#9ca3af]">
                            ID: {cert.credentialId}
                          </Text>
                        )}
                      </View>
                    </View>
                    {index < Math.min(certificates.length, 3) - 1 && (
                      <View className="my-2.5 h-px bg-[#dfe3f1]" />
                    )}
                  </View>
                ))
              )}
            </Card>
          </View>

          <View className="mt-5 px-3">
            <SectionHeader
              title="Skills"
              action={
                <View className="flex-row items-center gap-2">
                  <HeaderIcon onPress={() => setIsAddSkillOpen(true)}>
                    <SimplePlus />
                  </HeaderIcon>
                </View>
              }
            />
            <Card className="px-3 py-2.5">
              <View className="flex-row flex-wrap gap-2">
                {skills.length === 0 ? (
                  <Text className="text-sm text-[#6b7280]">
                    No skills added yet.
                  </Text>
                ) : (
                  skills.map((skill) => (
                    <View
                      key={skill.id}
                      className="rounded-sm border border-[#dfe4fb] bg-[#f3f5ff] px-3 py-1.5"
                    >
                      <Text className="text-xs font-medium text-[#4e5cf0]">
                        {skill.name || skill.title || 'Skill'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </Card>
          </View>

          <View className="mt-5 px-3">
            <SectionHeader
              title="Additional Details"
              action={
                <HeaderIcon onPress={() => setIsEditPhoneOpen(true)}>
                  <SimpleEdit />
                </HeaderIcon>
              }
            />
            <Card className="px-3 py-3">
              <View className="flex-row items-center gap-3 py-2">
                <SimpleMail />
                <View>
                  <Text className="text-xs font-medium text-[#556070]">
                    Email
                  </Text>
                  <Text className="mt-1 text-sm text-[#4e5cf0]">{email}</Text>
                </View>
              </View>
              <View className="my-3 h-px bg-[#dfe3f1]" />
              <View className="flex-row items-center gap-3 py-2">
                <SimplePhone />
                <View>
                  <Text className="text-xs font-medium text-[#556070]">
                    Phone
                  </Text>
                  <Text className="mt-1 text-sm text-[#1f2937]">{phone}</Text>
                </View>
              </View>
            </Card>
          </View>

          <View className="mt-5 px-3">
            <SectionHeader
              title="Social Links"
              action={
                <View className="flex-row items-center gap-2">
                  <HeaderIcon
                    onPress={() => {
                      setSocialModalMode('add');
                      setEditingSocial(null);
                      setIsSocialModalOpen(true);
                    }}
                  >
                    <SimplePlus />
                  </HeaderIcon>
                  <HeaderIcon
                    onPress={() => {
                      setSocialModalMode('manage');
                      setEditingSocial(null);
                      setIsSocialModalOpen(true);
                    }}
                  >
                    <SimpleEdit />
                  </HeaderIcon>
                </View>
              }
            />
            <Card className="px-3 py-3">
              {socials.length === 0 ? (
                <Text className="text-sm text-[#6b7280]">
                  No social links added yet.
                </Text>
              ) : (
                socials.map((social, index) => (
                  <TouchableOpacity
                    key={social.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSocialModalMode('manage');
                      setEditingSocial(null);
                      setIsSocialModalOpen(true);
                    }}
                  >
                    <View className="flex-row items-center gap-3 py-2">
                      {social.platform.toLowerCase().includes('instagram') ? (
                        <InstagramIcon />
                      ) : social.platform.toLowerCase().includes('twitter') ? (
                        <TwitterIcon />
                      ) : (
                        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#6b7280]">
                          <Text className="text-xs font-bold text-white">
                            {social.platform.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-xs font-medium text-[#556070] uppercase">
                          {social.platform}
                        </Text>
                        <Text className="mt-1 text-sm text-[#4e5cf0]">
                          {social.url.replace(/^https?:\/\//, '')}
                        </Text>
                      </View>
                    </View>
                    {index < socials.length - 1 && (
                      <View className="my-2.5 h-px bg-[#dfe3f1]" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Card>
          </View>
        </ScrollView>
      )}

      <CandidateDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath="/pages/candidate/public-profile"
      />

      <EditAboutModal
        visible={isEditAboutOpen}
        onClose={() => setIsEditAboutOpen(false)}
        aboutId={profile?.about?.id}
        initialBio={profile?.about?.bio}
        onSaved={() => void refetch()}
      />
      <EditExperienceModal
        visible={isAddExperienceOpen}
        onClose={() => setIsAddExperienceOpen(false)}
        onSaved={() => void refetch()}
      />
      <EditEducationModal
        visible={isAddEducationOpen}
        onClose={() => setIsAddEducationOpen(false)}
        onSaved={() => void refetch()}
      />
      <EditCertificateModal
        visible={isAddCertificateOpen}
        onClose={() => setIsAddCertificateOpen(false)}
        onSaved={() => void refetch()}
      />
      <EditSkillModal
        visible={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        onSaved={() => void refetch()}
      />

      <AiFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        score={
          activeResumeId
            ? profile?.resumes?.find((r) => r.id === activeResumeId)?.aiScore ??
              null
            : null
        }
        feedback={
          activeResumeId
            ? (() => {
                const res = profile?.resumes?.find(
                  (r) => r.id === activeResumeId
                );
                try {
                  return res?.aiFeedback
                    ? typeof res.aiFeedback === 'string'
                      ? JSON.parse(res.aiFeedback)
                      : res.aiFeedback
                    : null;
                } catch {
                  return null;
                }
              })()
            : null
        }
      />

      <CvSyncCompareModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        currentData={profile}
        newData={
          activeResumeId
            ? (() => {
                const res = profile?.resumes?.find(
                  (r) => r.id === activeResumeId
                );
                try {
                  return res?.parsedText
                    ? typeof res.parsedText === 'string'
                      ? JSON.parse(res.parsedText)
                      : res.parsedText
                    : null;
                } catch {
                  return null;
                }
              })()
            : null
        }
        onSync={handleSyncResume}
        onExtract={() => {
          if (activeResumeId) {
            handleTriggerParse(activeResumeId);
            setSyncModalOpen(false);
          }
        }}
        isLoading={false}
        isSynced={
          !!(activeResumeId
            ? profile?.resumes?.find((r) => r.id === activeResumeId)
                ?.isSyncedToProfile
            : false)
        }
      />

      <CvDeleteImpactModal
        isOpen={deleteImpactModalOpen}
        onClose={() => setDeleteImpactModalOpen(false)}
        onConfirm={handleConfirmDeleteResume}
        isLoading={!!deletingResumeId}
        resumeName={
          activeResumeId
            ? profile?.resumes?.find((r) => r.id === activeResumeId)
                ?.fileName || 'Selected CV'
            : ''
        }
        resumeId={activeResumeId || 0}
        currentData={profile}
        experiences={experiences}
        educations={educations}
        skills={skills}
        certificates={certificates}
        contacts={contacts}
        socials={socials}
      />

      <EditSocialModal
        visible={isSocialModalOpen}
        onClose={() => {
          setIsSocialModalOpen(false);
          setEditingSocial(null);
        }}
        mode={socialModalMode}
        social={editingSocial}
        socials={socials}
        onSaved={() => void refetch()}
      />

      <EditPhoneModal
        visible={isEditPhoneOpen}
        onClose={() => setIsEditPhoneOpen(false)}
        currentPhone={profile?.phoneNumber || ''}
        onSaved={() => void refetch()}
      />
    </SafeAreaView>
  );
}

export default function CandidatePublicProfileScreen() {
  return (
    <AiProcessingProvider>
      <ProfileContent />
    </AiProcessingProvider>
  );
}
