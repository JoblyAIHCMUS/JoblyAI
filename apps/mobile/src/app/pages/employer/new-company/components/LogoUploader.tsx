import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageIcon, X } from 'lucide-react-native';

interface LogoUploaderProps {
  onValueChange?: (logoUrl: string | null, file?: any) => void;
  currentFileKey?: string | null;
  currentLogoUrl?: string | null;
}

export const LogoUploader = React.forwardRef<
  { resetPreview: () => void },
  LogoUploaderProps
>(function LogoUploader(
  { onValueChange, currentFileKey, currentLogoUrl },
  ref
) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading] = useState(false);

  React.useImperativeHandle(ref, () => ({
    resetPreview: () => {
      setPreview(null);
    },
  }));

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreview(asset.uri);
        onValueChange?.(asset.uri, asset);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onValueChange?.(null, null);
  };

  const showRemove = preview || currentLogoUrl;

  return (
    <View className="flex-row gap-4">
      {/* Preview */}
      <View className="relative shrink-0">
        <View
          className="flex items-center justify-center rounded-xl bg-indigo-50 overflow-hidden"
          style={{ width: 100, height: 100 }}
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : currentLogoUrl ? (
            <Image
              source={{ uri: currentLogoUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <ImageIcon size={32} color="#A5B4FC" strokeWidth={1.5} />
          )}
        </View>
        {showRemove && (
          <TouchableOpacity
            onPress={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <X size={14} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {/* Upload zone */}
      <View className="flex-1">
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={loading}
          className="border-2 border-dashed border-indigo-200 rounded-lg p-4 bg-indigo-50 flex items-center justify-center min-h-[100px]"
        >
          {loading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <View className="gap-2 items-center">
              <ImageIcon size={24} color="#4F46E5" strokeWidth={1.5} />
              <Text className="text-sm font-medium text-indigo-600">
                Tap to upload
              </Text>
              <Text className="text-xs text-slate-500 text-center">
                SVG, PNG, JPG
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default LogoUploader;
