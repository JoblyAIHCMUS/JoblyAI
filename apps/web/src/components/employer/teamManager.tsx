'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  TeamMemberCard,
  type TeamMemberRole,
} from '@/components/employer/teamMemberCard';
import { TeamMemberSearch } from '@/components/employer/teamMemberSearch';
import { Plus } from 'lucide-react';
import type { TeamMember } from '@/features/employer/new-company/data';

export interface TeamMemberData extends TeamMember {
  membershipId?: number;
}

interface TeamManagerProps {
  members: TeamMemberData[];
  canManage?: boolean;
  currentUserEmail?: string;
  ownerMembershipId?: number | null;
  busy?: boolean;
  onRoleChange?: (email: string, newRole: TeamMemberRole) => void;
  onAddMember?: (member: TeamMember) => void;
  onRemoveMember?: (member: TeamMemberData) => void;
}

export function TeamManager({
  members,
  canManage = false,
  currentUserEmail,
  ownerMembershipId,
  busy = false,
  onRoleChange,
  onAddMember,
  onRemoveMember,
}: TeamManagerProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
      <div className="pt-0 md:pt-3">
        <Label className="label-label-1-semibold text-sm sm:text-base">
          Team Members
        </Label>
        <p className="text-xs text-slate-500 mt-1">
          Manage team members of your company
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-start">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm"
            type="button"
            onClick={() => setSearchOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Members</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {members.map((member) => {
            const isOwner =
              ownerMembershipId != null &&
              member.membershipId === ownerMembershipId;
            const normalizedRole: TeamMemberRole =
              member.role === 'admin' || isOwner ? 'admin' : 'employee';

            return (
              <TeamMemberCard
                key={member.email}
                firstName={member.firstName}
                lastName={member.lastName}
                avatar={member.avatar}
                email={member.email}
                role={normalizedRole}
                canManage={canManage}
                isOwner={isOwner}
                isSelf={
                  member.email.toLowerCase() === currentUserEmail?.toLowerCase()
                }
                disabled={busy}
                onRoleChange={(newRole) =>
                  onRoleChange?.(member.email, newRole)
                }
                onRemove={() => onRemoveMember?.(member)}
              />
            );
          })}
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
