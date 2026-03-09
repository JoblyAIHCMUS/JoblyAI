'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TeamMemberCard } from '@/components/employer/teamMemberCard';
import { TeamMemberSearch } from '@/components/employer/teamMemberSearch';
import { Plus } from 'lucide-react';
import type { TeamMember } from '@/features/employer/new-company/data';

export interface TeamMemberData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  isEditable?: boolean;
}

interface TeamManagerProps {
  members: TeamMemberData[];
  onRoleChange?: (email: string, newRole: string) => void;
  onAddMember?: (member: TeamMember) => void;
}

export function TeamManager({
  members,
  onRoleChange,
  onAddMember,
}: TeamManagerProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
      <div className="pt-3">
        <Label className="label-label-1-semibold">Team Members</Label>
        <p className="text-xs text-slate-500 mt-1">
          Manage team members of your company
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-start">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            type="button"
            onClick={() => setSearchOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Members
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <TeamMemberCard
              key={member.email}
              firstName={member.firstName}
              lastName={member.lastName}
              avatar={member.avatar}
              email={member.email}
              role={member.role}
              isEditable={member.isEditable}
              onRoleChange={(newRole) => onRoleChange?.(member.email, newRole)}
            />
          ))}
        </div>
      </div>

      <TeamMemberSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(member) => onAddMember?.(member)}
        excludeEmails={members.map((m) => m.email)}
      />
    </div>
  );
}
