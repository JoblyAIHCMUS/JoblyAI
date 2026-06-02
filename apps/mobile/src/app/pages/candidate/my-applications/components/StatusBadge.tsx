import { View } from 'react-native';

import { Text } from '@/components/ui/text';

import type { ApplicationStatus } from '../../dashboard/types';

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; containerClassName: string; textClassName: string }
> = {
  APPLIED: {
    label: 'Applied',
    containerClassName: 'bg-app-indigo-soft',
    textClassName: 'text-app-indigo-strong',
  },
  INTERVIEW: {
    label: 'Interview',
    containerClassName: 'bg-app-amber-1/20',
    textClassName: 'text-app-orange-1',
  },
  OFFER: {
    label: 'Offer',
    containerClassName: 'bg-app-emerald-1',
    textClassName: 'text-app-emerald-2',
  },
  REJECTED: {
    label: 'Rejected',
    containerClassName: 'bg-app-red-1/10',
    textClassName: 'text-app-red-2',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    containerClassName: 'bg-app-background-2',
    textClassName: 'text-app-text-5',
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <View className={`self-start rounded-full px-3 py-1.5 ${meta.containerClassName}`}>
      <Text className={`text-xs font-bold ${meta.textClassName}`}>
        {meta.label}
      </Text>
    </View>
  );
}
