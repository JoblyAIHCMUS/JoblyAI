'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pencil, Check } from 'lucide-react';

interface TeamMemberCardProps {
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  role: string;
  isEditable?: boolean;
  onRoleChange?: (newRole: string) => void;
}

export function TeamMemberCard({
  firstName,
  lastName,
  avatar,
  email,
  role,
  isEditable = false,
  onRoleChange,
}: TeamMemberCardProps) {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editedRole, setEditedRole] = useState(role);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleConfirmRole = () => {
    onRoleChange?.(editedRole);
    setIsEditingRole(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmRole();
    } else if (e.key === 'Escape') {
      setEditedRole(role);
      setIsEditingRole(false);
    }
  };

  return (
    <Card className="flex flex-col items-center p-6 gap-3">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatar} alt={`${firstName} ${lastName}`} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>

      <div className="text-center">
        <p className="label-label-1-semibold">
          {firstName} {lastName}
        </p>

        <div className="flex items-center justify-center gap-1.5 mt-1">
          {isEditingRole ? (
            <>
              <Input
                value={editedRole}
                onChange={(e) => setEditedRole(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 text-sm text-center w-36"
                autoFocus
              />
              <button
                onClick={handleConfirmRole}
                className="text-slate-500 hover:text-slate-700 shrink-0"
                aria-label="Confirm role"
              >
                <Check className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <p className="body-body-2-regular text-slate-500">{role}</p>
              {isEditable && (
                <button
                  onClick={() => setIsEditingRole(true)}
                  className="text-slate-400 hover:text-slate-600 shrink-0"
                  aria-label="Edit role"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <p className="body-body-3-regular text-slate-400">{email}</p>
    </Card>
  );
}
