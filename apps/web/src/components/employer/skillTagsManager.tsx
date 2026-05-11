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
import { useSearchSkills } from '@/api-hook/skills';

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
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const { results: searchResults, search } = useSearchSkills();

  // Filter out already-added skills
  const filteredResults = searchResults.filter(
    (skill) =>
      !skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())
  );

  const handleAdd = () => {
    const trimmed = newSkillName.trim();
    if (
      trimmed &&
      !skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    ) {
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
    setSelectedDropdownIndex(-1);
    skillInputRef.current?.focus();
  };

  const handleSelectFromDropdown = (skillName: string) => {
    setNewSkillName(skillName);
    setSelectedDropdownIndex(-1);
    setShowDropdown(false);
  };

  const handleRemove = (skillName: string) => {
    onChange(skills.filter((s) => s.name !== skillName));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (
        selectedDropdownIndex >= 0 &&
        filteredResults[selectedDropdownIndex]
      ) {
        handleSelectFromDropdown(filteredResults[selectedDropdownIndex].name);
      }
    } else if (e.key === 'Escape') {
      setSelectedDropdownIndex(-1);
      setShowDropdown(false);
      if (newSkillName.length === 0) {
        setIsAdding(false);
        setNewMinYears('');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedDropdownIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDropdownIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
  };

  const handleSkillInputChange = (value: string) => {
    setNewSkillName(value);
    setSelectedDropdownIndex(-1);
    if (value.trim()) {
      setShowDropdown(true);
      search(value);
    } else {
      setShowDropdown(false);
    }
  };

  const groupedSkills = IMPORTANCE_ORDER.map((level) => ({
    level,
    label: IMPORTANCE_LABELS[level],
    items: skills.filter((s) => s.importance === level),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-2 sm:space-y-3">
      {isAdding ? (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
            <div className="relative min-w-0 sm:min-w-[200px]">
              <Input
                ref={skillInputRef}
                type="text"
                placeholder="Enter skill name"
                aria-label="Skill name"
                value={newSkillName}
                onChange={(e) => handleSkillInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-9 sm:h-10 w-full text-xs sm:text-sm"
                autoFocus
                autoComplete="off"
              />
              {newSkillName.trim() &&
                filteredResults.length > 0 &&
                showDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg z-10 max-h-40 sm:max-h-48 overflow-y-auto">
                    {filteredResults.map((skill, index) => (
                      <div
                        key={skill.id}
                        onClick={() => handleSelectFromDropdown(skill.name)}
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer transition-colors text-xs sm:text-sm ${
                          index === selectedDropdownIndex
                            ? 'bg-slate-200 text-slate-900 body-body-1-medium'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {skill.name}
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <Select
              value={newImportance}
              onValueChange={(v) => setNewImportance(v as SkillImportance)}
            >
              <SelectTrigger
                className="h-9 sm:h-10 w-full sm:w-[120px] md:w-[130px] text-xs sm:text-sm"
                aria-label="Skill importance"
              >
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
              aria-label="Minimum years of experience"
              value={newMinYears}
              onChange={(e) => setNewMinYears(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 sm:h-10 w-full sm:w-[90px] md:w-[100px] text-xs sm:text-sm"
              min="0"
            />
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm font-medium flex-shrink-0 disabled:opacity-50"
              onClick={handleAdd}
              disabled={!newSkillName.trim()}
            >
              Add
            </button>
            <button
              type="button"
              className="px-3 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm font-medium flex-shrink-0 rounded border border-slate-200 hover:bg-slate-50"
              onClick={() => {
                setIsAdding(false);
                setNewSkillName('');
                setNewMinYears('');
                setSelectedDropdownIndex(-1);
                setShowDropdown(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="text-primary border border-primary hover:bg-primary/5 rounded px-3 h-9 text-xs sm:text-sm font-medium"
          onClick={() => setIsAdding(true)}
        >
          + Add Skills
        </button>
      )}

      {groupedSkills.map((group) => (
        <div key={group.level} className="space-y-1.5 sm:space-y-2">
          <p className="caption-caption-1-medium text-slate-500 text-xs sm:text-sm">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {group.items.map((skill) => (
              <div
                key={skill.name}
                className="inline-flex items-center gap-1.5 pl-2 sm:pl-3 pr-1 py-1 sm:py-1.5 text-xs sm:text-sm bg-zinc-500/20 text-primary rounded border-0 hover:bg-zinc-600/25"
              >
                <span>
                  {skill.name}
                  {skill.minYearsExperience != null && (
                    <span className="ml-1 opacity-70">
                      ({skill.minYearsExperience}y+)
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(skill.name)}
                  className="ml-0.5 hover:bg-primary/20 rounded p-0.5"
                  aria-label={`Remove ${skill.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
