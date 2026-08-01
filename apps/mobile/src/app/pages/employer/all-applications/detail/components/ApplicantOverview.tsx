import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Mail, Phone, BarChart3 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import Avatar from '../../../../../../components/Avatar';
import { ApplicantDetail, hiringStageStyles } from '../../data';
import { HiringStageProgressBar } from './HiringStageProgressBar';
import { MatchExplanationDrawer } from './MatchExplanationDrawer';
import { useGetEmployerProfile } from '../../../../../../hooks/useGetEmployerProfile';
import { useMessageCandidate } from '../../../../../../hooks/messaging/useMessageCandidate';

interface ApplicantOverviewProps {
  applicant: ApplicantDetail;
}

export function ApplicantOverview({ applicant }: ApplicantOverviewProps) {
  const { data: employerProfile } = useGetEmployerProfile();
  const { mutateAsync: messageCandidate, isPending: isMessaging } =
    useMessageCandidate({ employerId: employerProfile?.id });
  const [showMatchExplanation, setShowMatchExplanation] = useState(false);
  const {
    image,
    name,
    title,
    appliedRole,
    jobCategory,
    employmentType,
    appliedDate,
    hiringStage,
    email,
    phone,
  } = applicant;

  const handleMessage = async () => {
    try {
      await messageCandidate(applicant.applicantId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to open conversation';
      Toast.show({
        type: 'error',
        text1: 'Message Failed',
        text2: message,
      });
    }
  };

  return (
    <View className="rounded-2xl border border-app-border-2 bg-white p-4 mb-4">
      <View className="items-center mb-3">
        <Avatar url={image} name={name} size={80} />
        <Text
          className="text-xl font-semibold text-app-slate-1 mt-3"
          numberOfLines={2}
        >
          {name}
        </Text>
        {title && (
          <Text className="text-sm text-app-text-3 mt-1" numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View className="rounded-xl bg-app-indigo-soft p-3 mb-3">
        <Text className="text-xs font-medium text-app-text-3">
          Applied Role
        </Text>
        <View className="h-px bg-app-border-3 my-1.5" />
        <Text
          className="text-sm font-semibold text-app-slate-1"
          numberOfLines={2}
        >
          {appliedRole}
        </Text>
        <Text className="text-xs text-app-text-3 mt-1">
          {jobCategory?.name} • {employmentType}
        </Text>
      </View>

      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-xs font-medium text-app-text-3">
            Applied Date
          </Text>
          <Text className="text-sm font-semibold text-app-slate-1 mt-0.5">
            {appliedDate}
          </Text>
        </View>
        <View>
          <Text className="text-xs font-medium text-app-text-3">Score</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowMatchExplanation(true)}
            className="flex flex-row items-center gap-1.5 mt-0.5"
          >
            <BarChart3 size={14} color="#4f46e5" />
            {applicant.score == null ? (
              <View className="px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50">
                <Text className="text-[10px] font-bold text-amber-700">
                  AI Calculating...
                </Text>
              </View>
            ) : (
              <Text className="text-sm font-semibold text-app-slate-1">
                {applicant.score.toFixed(2)}%
              </Text>
            )}
            <Text className="text-[10px] font-medium text-app-primary-1 underline">
              Click here to view analysis
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-2">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-medium text-app-text-3">
            Hiring Stage
          </Text>
          <View
            className={`border rounded-full px-3 py-1 ${hiringStageStyles[hiringStage]}`}
          >
            <Text className="text-xs font-semibold">{hiringStage}</Text>
          </View>
        </View>
        <HiringStageProgressBar hiringStage={hiringStage} />
      </View>

      <View className="h-px bg-app-border-2 my-3" />

      <View className="mb-3">
        <Text className="text-xs font-medium text-app-text-3 mb-2">
          Contact
        </Text>
        <View className="flex-row items-center mb-1.5">
          <Mail size={16} color="#64748B" />
          <Text
            className="ml-2 text-sm text-app-slate-1 flex-1"
            numberOfLines={1}
          >
            {email || '—'}
          </Text>
        </View>
        {phone ? (
          <View className="flex-row items-center">
            <Phone size={16} color="#64748B" />
            <Text
              className="ml-2 text-sm text-app-slate-1 flex-1"
              numberOfLines={1}
            >
              {phone}
            </Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={handleMessage}
        disabled={isMessaging}
        activeOpacity={0.7}
        className="w-full py-3 rounded-xl bg-app-primary-1 items-center flex-row justify-center"
        style={{ opacity: isMessaging ? 0.5 : 1 }}
      >
        <Mail size={16} color="#FFFFFF" />
        <Text className="ml-2 text-sm font-semibold text-white">
          {isMessaging ? 'Opening…' : 'Message'}
        </Text>
      </TouchableOpacity>

      <MatchExplanationDrawer
        applicationId={applicant.id}
        isOpen={showMatchExplanation}
        onClose={() => setShowMatchExplanation(false)}
      />
    </View>
  );
}
