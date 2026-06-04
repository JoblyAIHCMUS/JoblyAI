import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';

import { formatDate } from '../../../../../utils/date';
import { Applicant } from './ApplicantsTab';

export function PipelineCard({ applicant }: { applicant: Applicant }) {
  const isSvg =
    applicant.avatarUrl?.includes('.svg') ||
    applicant.avatarUrl?.includes('/svg');

  return (
    <View className="mb-4 rounded-sm border border-app-border-1 bg-white p-4 shadow-sm">
      <View className="mb-5 flex-row items-center">
        {isSvg ? (
          <View className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-app-gray-1">
            <SvgUri width="100%" height="100%" uri={applicant.avatarUrl} />
          </View>
        ) : (
          <Image
            source={{ uri: applicant.avatarUrl }}
            className="mr-4 h-12 w-12 rounded-full bg-app-gray-1"
          />
        )}
        <View className="min-w-0 flex-1">
          <Text className="truncate text-base font-semibold text-app-slate-1">
            {applicant.name}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              // TODO: wire to profile when route is available
            }}
          >
            <Text className="mt-1 text-sm font-medium text-app-primary-2">
              View Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="mb-1 text-xs font-medium text-app-text-3">
            Applied on
          </Text>
          <Text className="text-sm font-semibold text-app-slate-1">
            {formatDate(applicant.appliedDate)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="mb-1 text-xs font-medium text-app-text-3">
            Score
          </Text>
          <View className="flex-row items-center">
            <Star
              size={14}
              color={applicant.rating > 0 ? '#FFB836' : '#111827'}
              fill={applicant.rating > 0 ? '#FFB836' : 'transparent'}
            />
            <Text className="ml-1 text-sm font-semibold text-app-slate-1">
              {applicant.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
