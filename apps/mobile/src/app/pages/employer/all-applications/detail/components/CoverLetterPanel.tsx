import React from 'react';
import { Text, View } from 'react-native';

export function CoverLetterPanel() {
  return (
    <View className="rounded-2xl border border-app-border-2 bg-app-background-2 p-4">
      <Text className="text-base font-semibold text-app-slate-1 mb-2">
        Cover Letter
      </Text>
      <Text className="text-sm text-app-text-3">
        Cover letter details coming soon.
      </Text>
    </View>
  );
}
