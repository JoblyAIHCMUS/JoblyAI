import React, { useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MoreHorizontal, Star } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';

import { AllApplication } from '../types';
import { hiringStageStyles } from '../data';
import { COLORS } from '../../../../constants/theme';

interface AllApplicationsListItemProps {
  application: AllApplication;
  onMenuPress: (
    application: AllApplication,
    triggerPosition: { x: number; y: number; width: number; height: number }
  ) => void;
  onPressIn?: () => void;
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null || score === undefined || score === 0) {
    return (
      <View
        className="rounded-full px-2 py-0.5"
        style={{ backgroundColor: COLORS.tagOrangeBg }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: COLORS.tagOrangeText }}
        >
          AI Calculating…
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center border border-app-border-2 rounded-full px-2 py-0.5">
      <Star size={14} color={COLORS.badgeOrange} fill={COLORS.badgeOrange} />
      <Text className="text-sm text-app-text-3 font-medium ml-1">
        {score.toFixed(1)}
      </Text>
    </View>
  );
}

function StatusPill({
  hiringStage,
}: {
  hiringStage: AllApplication['hiringStage'];
}) {
  return (
    <View
      className={`border rounded-full px-4 py-1.5 ${hiringStageStyles[hiringStage]}`}
    >
      <Text className="text-sm font-semibold">{hiringStage}</Text>
    </View>
  );
}

export const AllApplicationsListItem: React.FC<
  AllApplicationsListItemProps
> = ({ application, onMenuPress, onPressIn }) => {
  const moreButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const isSvg =
    application.image?.includes('.svg') || application.image?.includes('/svg');

  const isTerminal =
    application.hiringStage === 'Rejected' ||
    application.hiringStage === 'Withdrawn';

  const handleMenuPress = () => {
    moreButtonRef.current?.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        onMenuPress(application, {
          x: pageX,
          y: pageY,
          width,
          height,
        });
      }
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={onPressIn}
      className="flex-row items-center justify-between py-4 border-b border-app-border-light"
    >
      <View className="flex-row items-center flex-1 mr-3">
        {isSvg ? (
          <View className="w-14 h-14 rounded-full mr-4 bg-app-gray-1 overflow-hidden">
            <SvgUri width="100%" height="100%" uri={application.image} />
          </View>
        ) : (
          <Image
            source={{ uri: application.image }}
            className="w-14 h-14 rounded-full mr-4 bg-app-gray-1"
          />
        )}

        <View className="flex-1 min-w-0">
          <Text
            className="text-lg font-semibold text-app-slate-1 mb-1"
            numberOfLines={1}
          >
            {application.name}
          </Text>
          <Text className="text-sm text-app-text-3" numberOfLines={1}>
            Applied for: {application.appliedRole}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <ScorePill score={application.score} />
        <StatusPill hiringStage={application.hiringStage} />

        {!isTerminal && (
          <TouchableOpacity
            ref={moreButtonRef}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleMenuPress}
            className="ml-1"
          >
            <MoreHorizontal size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
