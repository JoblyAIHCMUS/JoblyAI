import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`rounded-lg bg-slate-200 ${className}`}
      style={[{ opacity }, style]}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <View className="mb-4 rounded-2xl border border-app-gray-1 bg-white px-4 py-4">
      <View className="mb-4 flex-row items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </View>
      </View>
      <Skeleton className="mb-3 h-4 w-1/2" />
      <Skeleton className="mb-3 h-6 w-4/5" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </View>
  );
}

export function CompanyCardSkeleton() {
  return (
    <View className="rounded-[10px] border border-app-border-1 bg-white p-5">
      <View className="mb-4 flex-row items-start justify-between">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <Skeleton className="h-7 w-16 rounded-sm" />
      </View>
      <Skeleton className="mb-3 h-7 w-3/4" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-5/6" />
      <View className="flex-row gap-3">
        <Skeleton className="h-7 w-24 rounded-sm" />
        <Skeleton className="h-7 w-20 rounded-sm" />
      </View>
    </View>
  );
}

export function MessageSkeleton() {
  return (
    <View className="mb-3 flex-row items-center gap-3 rounded-xl border border-slate-100 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-4/5" />
      </View>
    </View>
  );
}

export function ApplicationsSkeleton() {
  return (
    <View className="w-full gap-3 py-3">
      {[0, 1, 2].map((item) => (
        <View
          key={item}
          className="rounded-2xl border border-app-border-light bg-white p-4"
        >
          <View className="flex-row items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </View>
          </View>
          <Skeleton className="mt-4 h-3 w-4/5" />
        </View>
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="flex-1 bg-app-background-2 px-3 pt-4">
      <Skeleton className="h-5 w-1/3" />
      <View className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
        <View className="items-center">
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="mt-4 h-6 w-2/5" />
          <Skeleton className="mt-2 h-4 w-3/5" />
        </View>
        <Skeleton className="mt-6 h-4 w-1/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </View>
      <Skeleton className="mt-4 h-32 w-full rounded-xl" />
    </View>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center rounded-2xl border border-app-border-light bg-app-neutral-1 px-6 py-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-app-indigo-soft">
        <Icon size={28} color="#4F46E5" strokeWidth={2} />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-app-text-4">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-app-text-5">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          className="mt-5 rounded-lg bg-app-primary-2 px-5 py-3"
          onPress={onAction}
        >
          <Text className="font-semibold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
