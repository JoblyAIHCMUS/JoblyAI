import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Mail, Phone } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { ApplicantDetail, hiringStageStyles } from '../../data';
import { HiringStageProgressBar } from './HiringStageProgressBar';
import { useGetEmployerProfile } from '../../../../../../hooks/useGetEmployerProfile';
import { useMessageCandidate } from '../../../../../../hooks/messaging/useMessageCandidate';

interface ApplicantOverviewProps {
  applicant: ApplicantDetail;
}

function isSvgUrl(url: string | undefined): boolean {
  return !!url && (url.includes('.svg') || url.includes('/svg'));
}

function Avatar({ url, name }: { url: string; name: string }) {
  if (isSvgUrl(url)) {
    return (
      <View className="w-20 h-20 rounded-full bg-app-gray-1 overflow-hidden">
        <SvgUri width="100%" height="100%" uri={url} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: url }}
      className="w-20 h-20 rounded-full bg-app-gray-1"
    />
  );
}

export function ApplicantOverview({ applicant }: ApplicantOverviewProps) {
  const { data: employerProfile } = useGetEmployerProfile();
  const { mutateAsync: messageCandidate, isPending: isMessaging } =
    useMessageCandidate({ employerId: employerProfile?.id });
  const {
    image,
    name,
    title,
    appliedRole,
    jobCategory,
    employmentType,
    appliedDate,
    score,
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
        <Avatar url={image} name={name} />
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
          <Text className="text-sm font-semibold text-app-slate-1 mt-0.5">
            {score.toFixed(1)}
          </Text>
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
    </View>
  );
}
