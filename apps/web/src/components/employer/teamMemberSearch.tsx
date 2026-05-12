'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { type TeamMember } from '@/features/employer/new-company/data';
import { useSearchEmployers } from '@/api-hook/employer';

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
  const { results: employerResults, loading, search } = useSearchEmployers();

  useEffect(() => {
    if (!open) {
      return;
    }

    void search(query);
  }, [open, query, search]);

  const results = useMemo(
    () =>
      employerResults
        .map((member) => ({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          avatar: member.avatarUrl,
          role: 'None',
        }))
        .filter((user) => !excludeEmails.includes(user.email)),
    [employerResults, excludeEmails]
  );

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
      <DialogContent className="p-0 gap-0 max-w-sm sm:max-w-md">
        <DialogHeader className="px-3 sm:px-4 pt-4 pb-2">
          <DialogTitle className="text-base sm:text-lg">
            Add Team Member
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Search by name or email to add a member to your team.
          </DialogDescription>
        </DialogHeader>

        <Command shouldFilter={false} className="border-t">
          <CommandInput
            placeholder="Search by name or email..."
            value={query}
            onValueChange={setQuery}
            className="text-xs sm:text-sm"
          />
          <CommandList>
            {query.trim() !== '' && loading && (
              <CommandEmpty className="text-xs sm:text-sm">
                Searching members...
              </CommandEmpty>
            )}
            {query.trim() !== '' && !loading && results.length === 0 && (
              <CommandEmpty className="text-xs sm:text-sm">
                No members found.
              </CommandEmpty>
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
                      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer text-xs sm:text-sm"
                    >
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <AvatarImage
                          src={member.avatar}
                          alt={`${member.firstName} ${member.lastName}`}
                        />
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="label-label-2-medium truncate text-xs sm:text-sm">
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
