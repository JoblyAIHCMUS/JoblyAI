import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import SettingsScreen from '../../settings/SettingsScreen';
import { getFullName, useUser } from '../../../../hooks/useUser';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { useDeleteEmployerAvatar } from '../../../../hooks/useDeleteAvatar';
import {
  createUploadUrl,
  uploadFileToGcs,
  deleteGcsFile,
} from '../../../../api/gcs';
import { updateAvatar } from '../../../../api/employer';

export default function EmployerSettingsPage() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { data: profile } = useGetEmployerProfile();
  const deleteAvatarMutation = useDeleteEmployerAvatar();
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);

  const handleChangeAvatar = async () => {
    setIsChangingAvatar(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        setIsChangingAvatar(false);
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName || `avatar_${Date.now()}.jpg`;
      const fileType = asset.mimeType || 'image/jpeg';

      const uploadUrlRes = await createUploadUrl({
        fileName,
        fileType,
        folder: 'avatars',
      });

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      await uploadFileToGcs(uploadUrlRes.uploadUrl, blob, fileType);

      const oldAvatarUrl = profile?.avatarUrl;
      await updateAvatar({
        fileKey: uploadUrlRes.fileKey,
        fileUrl: uploadUrlRes.fileUrl,
      });

      if (oldAvatarUrl && oldAvatarUrl.includes('/avatars/')) {
        const oldKey = oldAvatarUrl.split('/avatars/')[1]?.split('?')[0];
        if (oldKey) {
          deleteGcsFile(oldKey).catch(() => undefined);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
      Toast.show({ type: 'success', text1: 'Profile picture updated' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile picture',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setIsChangingAvatar(false);
    }
  };

  return (
    <SettingsScreen
      role="employer"
      account={{
        name: profile?.fullName || getFullName(user) || 'Employer',
        email: profile?.email || user?.email || '',
        avatarUrl: profile?.avatarUrl || user?.avatarUrl,
        caption: profile?.company?.name || 'Employer account',
      }}
      onRemoveAvatar={() => deleteAvatarMutation.mutateAsync()}
      isRemovingAvatar={deleteAvatarMutation.isPending}
      onChangeAvatar={handleChangeAvatar}
      isChangingAvatar={isChangingAvatar}
    />
  );
}
