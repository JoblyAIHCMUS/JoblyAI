import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Trash2, ChevronDown } from 'lucide-react-native';
import ModalPicker from './ModalPicker';
import type { CompanyRole } from '../../../../../api/company';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'admin' },
  { value: 'employee', label: 'employee' },
] as const;

interface TeamMemberCardProps {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
  canManage: boolean;
  isOwner: boolean;
  isSelf: boolean;
  disabled?: boolean;
  onRoleChange?: (newRole: CompanyRole) => void;
  onRemove?: () => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  firstName,
  lastName,
  email,
  avatar,
  role,
  canManage,
  isOwner,
  isSelf,
  disabled = false,
  onRoleChange,
  onRemove,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const roleLocked = !canManage || isOwner || isSelf || disabled;
  const canRemove = canManage && !isOwner && !isSelf && !disabled;

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
        <Text
          className="text-sm font-semibold text-slate-900 truncate"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {firstName} {lastName}
        </Text>
        <Text
          className="text-xs text-slate-500 truncate"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {email}
        </Text>
      </View>

      {/* Role Selector / Chip */}
      {roleLocked ? (
        <View className="px-3 py-2 bg-slate-50 rounded-lg">
          <Text className="text-xs font-medium text-slate-700">{role}</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center gap-1 px-3 py-2 bg-slate-50 rounded-lg active:bg-slate-100"
          >
            <Text className="text-xs font-medium text-slate-700">{role}</Text>
            <ChevronDown size={14} color="#475569" strokeWidth={1.5} />
          </TouchableOpacity>
          <ModalPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            options={ROLE_OPTIONS}
            selectedValue={role}
            onSelect={(value) => onRoleChange?.(value as CompanyRole)}
            title="Select Role"
          />
        </>
      )}

      {/* Remove Button */}
      {canRemove && (
        <TouchableOpacity
          onPress={onRemove}
          disabled={disabled}
          className="p-2 rounded-lg active:bg-red-50"
        >
          <Trash2 size={18} color="#EF4444" strokeWidth={1.5} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TeamMemberCard;
