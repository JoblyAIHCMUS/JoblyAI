'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { CandidateSkill } from '@/api-client/candidate/types';
import { useSearchSkills } from '@/api-hook/skills';
import { formatErrorForDisplay } from '@/lib/errors';

interface SkillsProps {
  skills: CandidateSkill[];
  handleAddSkill?: (skill: string) => Promise<void> | void;
  handleDeleteSkill?: (skillId: number) => void;
}

export default function Skills({
  skills,
  handleAddSkill,
  handleDeleteSkill,
}: Readonly<SkillsProps>) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, loading, search } = useSearchSkills();

  const suggestions = useMemo(
    () =>
      results.filter(
        (skill) =>
          !skills.some(
            (existingSkill) =>
              existingSkill.title.trim().toLowerCase() ===
              skill.name.trim().toLowerCase()
          )
      ),
    [results, skills]
  );

  useEffect(() => {
    if (!isAdding) {
      return;
    }

    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    void search(trimmedSkill);
  }, [isAdding, newSkill, search]);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewSkill('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    setSaveError(null);
  };

  const handleSave = async () => {
    const trimmedSkill = newSkill.trim();
    if (!handleAddSkill || !trimmedSkill) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await handleAddSkill(trimmedSkill);
      setIsAdding(false);
      setNewSkill('');
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    } catch (error) {
      setSaveError(formatErrorForDisplay(error, 'Failed to add skill'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewSkill('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    setSaveError(null);
  };

  const handleSelectSuggestion = (skillName: string) => {
    setNewSkill(skillName);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        void handleSave();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selectedSuggestion =
        highlightedIndex >= 0 ? suggestions[highlightedIndex] : suggestions[0];

      if (selectedSuggestion) {
        handleSelectSuggestion(selectedSuggestion.name);
        return;
      }

      void handleSave();
      return;
    }

    if (event.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (value: string) => {
    setNewSkill(value);
    setSaveError(null);
    setHighlightedIndex(-1);
    setIsDropdownOpen(value.trim().length > 0);
  };

  return (
    <div className="rounded-[var(--radius-lg)] border bg-primary px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Skills
        </div>
        <div className="flex gap-2">
          {!isAdding && (
            <button
              className="p-[var(--space-xs)] rounded-[var(--radius-md)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
              onClick={handleAddClick}
            >
              <Plus size={16} className="text-accent-primary" />
            </button>
          )}
        </div>
      </div>
      {isAdding && (
        <div className="flex flex-col px-4 gap-2 mt-2">
          <div className="relative">
            <input
              ref={inputRef}
              className="body-body-1-regular text-primary break-words border rounded p-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-accent-primary w-full"
              value={newSkill}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (newSkill.trim()) {
                  setIsDropdownOpen(true);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => setIsDropdownOpen(false), 150);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Enter a new skill"
              autoFocus
              autoComplete="off"
            />
            {isDropdownOpen && newSkill.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                {loading && (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Searching skills...
                  </div>
                )}
                {!loading && suggestions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    No matching skills found.
                  </div>
                )}
                {!loading &&
                  suggestions.map((skill, index) => (
                    <button
                      key={skill.id}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        index === highlightedIndex
                          ? 'bg-slate-100 text-slate-900'
                          : 'hover:bg-slate-50'
                      }`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSelectSuggestion(skill.name);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {skill.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
          {saveError && <p className="text-sm text-danger">{saveError}</p>}
          <div className="flex gap-2 mt-2">
            <button
              className="px-4 py-2 rounded bg-accent-solid text-white"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-3 px-4">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="label-label-1-regular bg-accent-primary text-accent-primary break-words px-3 py-1 rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] flex items-center gap-2"
          >
            {skill.title}
            {handleDeleteSkill && (
              <button
                className="ml-1 text-danger hover:underline"
                onClick={() => handleDeleteSkill(skill.id)}
                aria-label={`Delete ${skill.title}`}
                type="button"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
