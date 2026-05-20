import React from 'react';
import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import { Trash2 } from 'lucide-react-native';

interface TeamMemberCardProps {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
  isEditable?: boolean;
  onRoleChange?: (newRole: string) => void;
  onRemove?: () => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  firstName,
  lastName,
  email,
  avatar,
  role,
  isEditable = false,
  onRoleChange,
  onRemove,
}) => {
  return (
    <View className="flex-row items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg mb-3">
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center shrink-0">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-lg font-bold text-indigo-600">
            {firstName[0]}
            {lastName[0]}
          </Text>
        )}
      </View>

      {/* Member Info */}
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-slate-900 truncate">
          {firstName} {lastName}
        </Text>
        <Text className="text-xs text-slate-500 truncate">{email}</Text>
      </View>

      {/* Role Selector */}
      {isEditable ? (
        <TextInput
          value={role}
          onChangeText={onRoleChange}
          placeholder="Role"
          placeholderTextColor="#94a3b8"
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 min-w-24"
        />
      ) : (
        <View className="px-3 py-2 bg-slate-50 rounded-lg">
          <Text className="text-xs font-medium text-slate-700">{role}</Text>
        </View>
      )}

      {/* Remove Button */}
      {isEditable && (
        <TouchableOpacity
          onPress={onRemove}
          className="p-2 rounded-lg active:bg-red-50"
        >
          <Trash2 size={18} color="#EF4444" strokeWidth={1.5} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TeamMemberCard;
