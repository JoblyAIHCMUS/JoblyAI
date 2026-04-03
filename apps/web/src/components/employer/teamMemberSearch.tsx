'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  searchEmployers,
  type TeamMember,
} from '@/features/employer/new-company/data';

interface TeamMemberSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (member: TeamMember) => void;
  excludeEmails?: string[];
}

export function TeamMemberSearch({
  open,
  onOpenChange,
  onSelect,
  excludeEmails = [],
}: TeamMemberSearchProps) {
  const [query, setQuery] = useState('');

  const results = open
    ? searchEmployers(query).filter(
        (user) => !excludeEmails.includes(user.email)
      )
    : [];

  const handleSelect = (member: TeamMember) => {
    onSelect(member);
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setQuery('');
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-md">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Search by name or email to add a member to your team.
          </DialogDescription>
        </DialogHeader>

        <Command shouldFilter={false} className="border-t">
          <CommandInput
            placeholder="Search by name or email..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() !== '' && results.length === 0 && (
              <CommandEmpty>No members found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((member) => {
                  const initials = `${member.firstName.charAt(
                    0
                  )}${member.lastName.charAt(0)}`.toUpperCase();
                  return (
                    <CommandItem
                      key={member.email}
                      value={member.email}
                      onSelect={() => handleSelect(member)}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                          src={member.avatar}
                          alt={`${member.firstName} ${member.lastName}`}
                        />
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="label-label-2-medium truncate">
                          {member.firstName} {member.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
