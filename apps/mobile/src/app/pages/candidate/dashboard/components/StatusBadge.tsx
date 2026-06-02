import { View } from 'react-native';

import { Text } from '@/components/ui/text';

import type { ApplicationStatus } from '../types';

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; containerClassName: string; textClassName: string }
> = {
  IN_REVIEW: {
    label: 'In Review',
    containerClassName: 'bg-app-indigo-soft',
    textClassName: 'text-app-indigo-strong',
  },
  INTERVIEWING: {
    label: 'Interviewing',
    containerClassName: 'bg-app-amber-1/20',
    textClassName: 'text-app-orange-1',
  },
  OFFERED: {
    label: 'Offered',
    containerClassName: 'bg-app-emerald-1',
    textClassName: 'text-app-emerald-2',
  },
  HIRED: {
    label: 'Hired',
    containerClassName: 'bg-app-background-1',
    textClassName: 'text-app-primary-2',
  },
  REJECTED: {
    label: 'Rejected',
    containerClassName: 'bg-app-red-1/10',
    textClassName: 'text-app-red-2',
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