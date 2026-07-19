'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

export type TeamMemberRole = 'admin' | 'employee';

interface TeamMemberCardProps {
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  role: TeamMemberRole;
  canManage?: boolean;
  isOwner?: boolean;
  isSelf?: boolean;
  disabled?: boolean;
  onRoleChange?: (newRole: TeamMemberRole) => void;
  onRemove?: () => void;
}

export function TeamMemberCard({
  firstName,
  lastName,
  avatar,
  email,
  role,
  canManage = false,
  isOwner = false,
  isSelf = false,
  disabled = false,
  onRoleChange,
  onRemove,
}: TeamMemberCardProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const roleLocked = !canManage || isOwner || isSelf || disabled;
  const canRemove = canManage && !isOwner && !isSelf && !disabled;

  return (
    <Card className="relative flex flex-col items-center p-4 sm:p-6 gap-2 sm:gap-3">
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
          aria-label={`Remove ${firstName} ${lastName}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
        <AvatarImage src={avatar} alt={`${firstName} ${lastName}`} />
        <AvatarFallback className="text-base sm:text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="text-center min-w-0 w-full">
        <p className="label-label-1-semibold text-xs sm:text-sm">
          {firstName} {lastName}
        </p>

        <div className="flex items-center justify-center mt-0.5 sm:mt-1 h-7">
          {roleLocked ? (
            <p className="body-body-2-regular text-slate-500 text-xs sm:text-sm">
              {role}
            </p>
          ) : (
            <Select
              value={role}
              onValueChange={(value) => onRoleChange?.(value as TeamMemberRole)}
            >
              <SelectTrigger
                className="h-7 w-28 sm:w-32 justify-center gap-1 border-none shadow-none text-xs sm:text-sm text-slate-500"
                aria-label="Member role"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="employee">employee</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <p
        className="body-body-3-regular text-slate-400 text-xs w-full min-w-0 truncate text-center"
        title={email}
      >
        {email}
      </p>
    </Card>
  );
}
