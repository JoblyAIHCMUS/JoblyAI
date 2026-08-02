import React from 'react';
import { View, Text, Image } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Badge } from './Badge';
import { getCardPreviewText } from '../../pages/find-jobs/utils';

export interface FeaturedJobProps {
  title: string;
  company: string;
  location: string;
  tags: string[];
  description: string;
  logoUrl?: string;
}

export const FeaturedJobCard = ({
  title,
  company,
  location,
  tags,
  description,
  logoUrl,
}: FeaturedJobProps) => {
  const getTagColors = (tag: string) => {
    switch (tag) {
      case 'Marketing':
        return { color: COLORS.tagOrangeBg, textColor: COLORS.tagOrangeText };
      case 'Design':
        return { color: COLORS.tagGreenBg, textColor: COLORS.tagGreenText };
      default:
        return { color: COLORS.surfaceSoft, textColor: COLORS.badgeBlue };
    }
  };

  return (
    <View className="bg-app-white-1 p-4 rounded-xl w-[280px] mr-4 border border-app-border-3">
      <View className="flex-row justify-between items-start mb-4">
        <View className="w-12 h-12 rounded-lg overflow-hidden bg-app-background-1">
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Badge label="Full Time" outline textColor={COLORS.badgeGreenText} />
      </View>
      <View className="mb-4 h-[100px]">
        <Text
          className="text-lg font-bold text-app-text-1 mb-1"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-sm text-app-text-2 mb-2" numberOfLines={1}>
          {company} • {location}
        </Text>
        <Text className="text-sm text-app-text-2 leading-5" numberOfLines={2}>
          {getCardPreviewText(description)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center mt-auto">
        <View className="flex-row flex-wrap gap-1 flex-1">
          {tags.map((tag, index) => {
            const { color, textColor } = getTagColors(tag);
            return (
              <Badge
                key={index}
                label={tag}
                color={color}
                textColor={textColor}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default FeaturedJobCard;
