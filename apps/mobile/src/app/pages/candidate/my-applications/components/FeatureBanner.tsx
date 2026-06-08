import { CalendarDays, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

interface FeatureBannerProps {
  visible: boolean;
  onClose: () => void;
}

export function FeatureBanner({ visible, onClose }: FeatureBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="rounded-2xl border border-app-border-light bg-app-background-2 px-4 py-4 shadow-sm shadow-black/5">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-app-indigo-soft">
          <CalendarDays size={18} color="#4F46E5" strokeWidth={2.2} />
        </View>

        <View className="flex-1 gap-1">
          <Text className="text-[22px] font-extrabold leading-7 text-app-indigo-strong">
            New Feature
          </Text>
          <Text className="text-sm leading-5 text-app-text-5">
            You can request a follow-up 7 days after applying for a job if the
            application status is in review. Only one follow-up is allowed per
            job.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss feature banner"
          className="h-8 w-8 items-center justify-center rounded-full"
          onPress={onClose}
        >
          <X size={20} color="#202430" strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}
