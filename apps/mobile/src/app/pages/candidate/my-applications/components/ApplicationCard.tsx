import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Building2, CalendarDays, MapPin, X } from 'lucide-react-native';

import { Text } from '../../../../../components/ui/text';
import { StatusBadge } from './StatusBadge';
import type { ApplicationItem } from '../../dashboard/types';
import { formatLongDate, getInitials } from '../../dashboard/utils';
import { withdrawCandidateApplication } from '../../../../../api/application';

const LOGO_COLORS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
];

function getLogoColors(company: string) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

interface ApplicationCardProps {
  application: ApplicationItem;
  onWithdrawn?: () => void;
}

const WITHDRAWABLE_STATUSES = new Set(['APPLIED', 'INTERVIEW']);

export function ApplicationCard({
  application,
  onWithdrawn,
}: ApplicationCardProps) {
  const colors = getLogoColors(application.company);
  const canWithdraw = WITHDRAWABLE_STATUSES.has(application.status);
  const [withdrawing, setWithdrawing] = useState(false);

  async function handleWithdraw() {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              setWithdrawing(true);
              await withdrawCandidateApplication(Number(application.id));
              onWithdrawn?.();
            } catch {
              Alert.alert(
                'Error',
                'Failed to withdraw application. Please try again.'
              );
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View className="rounded-2xl border border-app-border-light bg-white px-4 py-4 shadow-sm shadow-black/5">
      <View className="flex-row items-start gap-3">
        {application.logoUrl ? (
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl">
            <Text className="text-sm font-extrabold text-app-text-4">
              {getInitials(application.company)}
            </Text>
          </View>
        ) : (
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${colors.bg}`}
          >
            <Text
              className={`text-sm font-extrabold tracking-wide ${colors.text}`}
            >
              {getInitials(application.company)}
            </Text>
          </View>
        )}

        <View className="flex-1 gap-1">
          <Text
            className="text-[17px] font-bold leading-6 text-app-text-4"
            numberOfLines={2}
          >
            {application.title}
          </Text>

          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <View className="flex-row items-center gap-1.5">
              <Building2 size={13} color="#7C8493" strokeWidth={2.1} />
              <Text className="text-xs text-app-text-5">
                {application.company}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <MapPin size={13} color="#7C8493" strokeWidth={2.1} />
              <Text className="text-xs text-app-text-5">
                {application.location}
              </Text>
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

      {canWithdraw && (
        <View className="mt-3 border-t border-app-border-light pt-3">
          <Pressable
            onPress={handleWithdraw}
            disabled={withdrawing}
            className="flex-row items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5"
          >
            <X size={14} color="#DC2626" strokeWidth={2.5} />
            <Text className="text-xs font-semibold text-red-600">
              {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
