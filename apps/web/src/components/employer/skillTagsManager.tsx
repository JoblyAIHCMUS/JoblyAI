'use client';

import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SkillImportance = 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';

export interface SkillEntry {
  name: string;
  importance: SkillImportance;
  minYearsExperience?: number;
}

const IMPORTANCE_OPTIONS: { value: SkillImportance; label: string }[] = [
  { value: 'REQUIRED', label: 'Required' },
  { value: 'PREFERRED', label: 'Preferred' },
  { value: 'OPTIONAL', label: 'Optional' },
];

const IMPORTANCE_ORDER: SkillImportance[] = [
  'REQUIRED',
  'PREFERRED',
  'OPTIONAL',
];

const IMPORTANCE_LABELS: Record<SkillImportance, string> = {
  REQUIRED: 'Required',
  PREFERRED: 'Preferred',
  OPTIONAL: 'Optional',
};

interface SkillTagsManagerProps {
  skills: SkillEntry[];
  onChange: (skills: SkillEntry[]) => void;
}

export function SkillTagsManager({ skills, onChange }: SkillTagsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newImportance, setNewImportance] =
    useState<SkillImportance>('REQUIRED');
  const [newMinYears, setNewMinYears] = useState('');
  const skillInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = newSkillName.trim();
    if (trimmed && !skills.some((s) => s.name === trimmed)) {
      const entry: SkillEntry = {
        name: trimmed,
        importance: newImportance,
      };
      const years = parseInt(newMinYears, 10);
      if (!isNaN(years) && years > 0) {
        entry.minYearsExperience = years;
      }
      onChange([...skills, entry]);
    }
    setNewSkillName('');
    setNewMinYears('');
    skillInputRef.current?.focus();
  };

  const handleRemove = (skillName: string) => {
    onChange(skills.filter((s) => s.name !== skillName));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewSkillName('');
      setNewMinYears('');
    }
  };

  const groupedSkills = IMPORTANCE_ORDER.map((level) => ({
    level,
    label: IMPORTANCE_LABELS[level],
    items: skills.filter((s) => s.importance === level),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-3">
      {isAdding ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            ref={skillInputRef}
            type="text"
            placeholder="Enter skill name"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 w-[200px]"
            autoFocus
          />
          <Select
            value={newImportance}
            onValueChange={(v) => setNewImportance(v as SkillImportance)}
          >
            <SelectTrigger className="h-10 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPORTANCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min years"
            value={newMinYears}
            onChange={(e) => setNewMinYears(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 w-[100px]"
            min="0"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!newSkillName.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewSkillName('');
              setNewMinYears('');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="text-primary border-primary hover:bg-primary/5"
        >
          + Add Skills
        </Button>
      )}

      {groupedSkills.map((group) => (
        <div key={group.level} className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((skill) => (
              <Badge
                key={skill.name}
                variant="secondary"
                className="pl-3 pr-1 py-1.5 text-sm bg-primary/10 text-primary border-0 hover:bg-primary/15"
              >
                {skill.name}
                {skill.minYearsExperience != null && (
                  <span className="ml-1 opacity-70">
                    ({skill.minYearsExperience}y+)
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(skill.name)}
                  className="ml-2 hover:bg-primary/20 rounded p-0.5"
                  aria-label={`Remove ${skill.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
