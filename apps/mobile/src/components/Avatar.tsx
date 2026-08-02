import React from 'react';
import {
  View,
  Text,
  Image,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SvgUri } from 'react-native-svg';

interface AvatarProps {
  url: string | null | undefined;
  name: string;
  size?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

function isSvgUrl(url: string): boolean {
  return (
    url.endsWith('.svg') ||
    url.includes('/svg') ||
    url.includes('image/svg+xml')
  );
}

const Avatar: React.FC<AvatarProps> = ({
  url,
  name,
  size = 40,
  className,
  style,
}) => {
  const sizeStyle = { width: size, height: size };

  if (!url) {
    return (
      <View
        className={`rounded-full bg-app-border-3 items-center justify-center ${
          className ?? ''
        }`}
        style={[sizeStyle, style]}
      >
        <Text className="text-base font-semibold text-app-slate-3">
          {(name ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  if (isSvgUrl(url)) {
    return (
      <View
        className={`rounded-full overflow-hidden bg-app-border-3 ${
          className ?? ''
        }`}
        style={[sizeStyle, style]}
      >
        <SvgUri uri={url} width="100%" height="100%" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      className={`rounded-full ${className ?? ''}`}
      resizeMode="cover"
      style={sizeStyle}
    />
  );
};

export default Avatar;
