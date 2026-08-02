import React from 'react';
import { View, Text, Image } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Badge } from './Badge';

export interface LatestJobProps {
  title: string;
  company: string;
  location: string;
  type: string;
  tags: string[];
  logoUrl?: string;
}

export const LatestJobCard = ({
  title,
  company,
  location,
  type,
  tags,
  logoUrl,
}: LatestJobProps) => {
  return (
    <View className="bg-app-white-1 p-4 rounded-2xl mb-4 border border-app-border-3">
      <View className="flex-row items-start">
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={{ width: 48, height: 48, borderRadius: 8, marginRight: 16 }}
            resizeMode="contain"
          />
        ) : (
          <View className="w-12 h-12 bg-app-background-1 rounded-lg mr-4" />
        )}
        <View className="flex-1">
          <Text className="text-base font-bold text-app-text-1 mb-1">
            {title}
          </Text>
          <Text className="text-sm text-app-text-2 mb-2">
            {company} • {location}
          </Text>
          <View className="flex-row flex-wrap gap-1 items-center">
            <Badge
              label={type}
              color={COLORS.badgeGreen}
              textColor={COLORS.badgeGreenText}
              outline
            />
            <View className="w-px h-6 bg-app-border-3 mx-1" />
            {tags.map((tag, index) => {
              const getTagStyles = (t: string) => {
                const lowerTag = t.toLowerCase();
                if (lowerTag === 'marketing')
                  return {
                    textColor: COLORS.badgeOrange,
                    color: 'transparent',
                  };
                if (lowerTag === 'design')
                  return {
                    textColor: COLORS.primary,
                    color: 'transparent',
                  };
                if (lowerTag === 'developer')
                  return {
                    textColor: COLORS.badgeBlue,
                    color: 'transparent',
                  };
                if (lowerTag === 'management')
                  return {
                    textColor: COLORS.typeContract,
                    color: 'transparent',
                  };
                return { textColor: COLORS.textLight, color: 'transparent' };
              };
              const { textColor, color } = getTagStyles(tag);
              return (
                <Badge
                  key={index}
                  label={tag}
                  color={color}
                  textColor={textColor}
                  outline
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default LatestJobCard;
