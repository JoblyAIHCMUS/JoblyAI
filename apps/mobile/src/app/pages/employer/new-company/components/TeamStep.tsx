import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Label } from '../../../../../components/ui/label';
import TeamMemberCard from './TeamMemberCard';
import TeamMemberSearch from './TeamMemberSearch';
import type { TeamMemberData, TeamMember } from '../data';
import type { CompanyRole } from '../../../../../api/company';
import { COLORS } from '@/app/constants/theme';

interface TeamStepProps {
  members: TeamMemberData[];
  canManage: boolean;
  currentUserEmail: string;
  onRoleChange: (email: string, newRole: CompanyRole) => void;
  onAddMember: (member: TeamMember) => void;
  onRemoveMember: (email: string) => void;
  errors: Record<string, any>;
}

export const TeamStep: React.FC<TeamStepProps> = ({
  members,
  canManage,
  currentUserEmail,
  onRoleChange,
  onAddMember,
  onRemoveMember,
  errors,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 gap-4 px-4 py-6"
      contentContainerClassName="gap-6 pb-8"
    >
      <View className="gap-2">
        <Label className="text-base font-semibold text-slate-900">
          Team Members
        </Label>
        <Text className="text-sm text-slate-600">
          Manage team members of your company
        </Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        onPress={() => setSearchOpen(true)}
        className="flex-row items-center justify-center gap-2 px-4 py-3 bg-indigo-600 rounded-lg active:bg-indigo-700"
      >
        <Plus size={20} color={COLORS.white} strokeWidth={2} />
        <Text className="text-white font-semibold">Add Members</Text>
      </TouchableOpacity>

      {/* Members List */}
      {members.length > 0 ? (
        <View className="gap-3">
          {members.map((member) => (
            <TeamMemberCard
              key={member.email}
              firstName={member.firstName}
              lastName={member.lastName}
              email={member.email}
              avatar={member.avatar}
              role={member.role}
              canManage={canManage}
              isOwner={false}
              isSelf={
                member.email.toLowerCase() === currentUserEmail.toLowerCase()
              }
              onRoleChange={(newRole) => onRoleChange(member.email, newRole)}
              onRemove={() => onRemoveMember(member.email)}
            />
          ))}
        </View>
      ) : (
        <View className="py-8 flex items-center justify-center bg-slate-50 rounded-lg">
          <Text className="text-sm text-slate-500 text-center">
            No team members added yet. Click "Add Members" to get started.
          </Text>
        </View>
      )}

      {errors.team && (
        <Text className="text-xs text-red-600">{errors.team.message}</Text>
      )}

      {/* Search Modal */}
      <TeamMemberSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={onAddMember}
        excludeEmails={members.map((m) => m.email)}
      />
    </ScrollView>
  );
};

export default TeamStep;
