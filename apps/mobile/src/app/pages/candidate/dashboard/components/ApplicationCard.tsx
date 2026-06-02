import { Building2, CalendarDays, MapPin } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '../../../../../components/ui/text';

import { StatusBadge } from './StatusBadge';
import type { ApplicationItem } from '../types';
import { formatLongDate, getInitials } from '../utils';

interface ApplicationCardProps {
  application: ApplicationItem;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <View className="rounded-2xl border border-app-border-light bg-white px-4 py-4 shadow-sm shadow-black/5">
      <View className="flex-row items-start gap-3">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${application.logoBackgroundClassName}`}
        >
          <Text
            className={`text-sm font-extrabold tracking-wide ${application.logoTextClassName}`}
          >
            {getInitials(application.company)}
          </Text>
        </View>

        <View className="flex-1 gap-1">
          <Text className="text-[17px] font-bold leading-6 text-app-text-4" numberOfLines={2}>
            {application.title}
          </Text>

          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <View className="flex-row items-center gap-1.5">
              <Building2 size={13} color="#7C8493" strokeWidth={2.1} />
              <Text className="text-xs text-app-text-5">{application.company}</Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <MapPin size={13} color="#7C8493" strokeWidth={2.1} />
              <Text className="text-xs text-app-text-5">{application.location}</Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <CalendarDays size={13} color="#7C8493" strokeWidth={2.1} />
              <Text className="text-xs text-app-text-5">
                {formatLongDate(application.appliedAt)}
              </Text>
            </View>
          </View>
        </View>

        <StatusBadge status={application.status} />
      </View>
    </View>
  );
}