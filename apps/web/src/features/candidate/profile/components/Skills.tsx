'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { CandidateSkill } from '@/api-client/candidate/types';
import { useSearchSkills } from '@/api-hook/skills';
import { formatErrorForDisplay } from '@/lib/errors';

interface SkillsProps {
  skills: CandidateSkill[];
  handleAddSkill?: (data: {
    title: string;
    level?: string;
    years?: number;
  }) => Promise<void> | void;
  handleUpdateSkill?: (
    id: number,
    data: { level?: string; years?: number }
  ) => Promise<void>;
  handleDeleteSkill?: (skillId: number) => void;
}

const SKILL_LEVELS = [
  'NOVICE',
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'MASTER',
] as const;

function formatLevel(level: string): string {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

export default function Skills({
  skills,
  handleAddSkill,
  handleUpdateSkill,
  handleDeleteSkill,
}: Readonly<SkillsProps>) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('');
  const [newSkillYears, setNewSkillYears] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, loading, search } = useSearchSkills();

  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editSkillLevel, setEditSkillLevel] = useState('');
  const [editSkillYears, setEditSkillYears] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const resetAddForm = () => {
    setIsAdding(false);
    setNewSkill('');
    setNewSkillLevel('');
    setNewSkillYears('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    setSaveError(null);
  };

  const handleAddClick = () => {
    if (editingSkillId !== null) return;
    resetAddForm();
    setIsAdding(true);
  };

  const handleSave = async () => {
    const trimmedSkill = newSkill.trim();
    if (!handleAddSkill || !trimmedSkill) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await handleAddSkill({
        title: trimmedSkill,
        level: newSkillLevel || undefined,
        years: newSkillYears ? parseInt(newSkillYears, 10) : undefined,
      });
      resetAddForm();
    } catch (error) {
      setSaveError(formatErrorForDisplay(error, 'Failed to add skill'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetAddForm();
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

  const startEditing = (skill: CandidateSkill) => {
    if (isAdding) return;
    setEditingSkillId(skill.id);
    setEditSkillLevel(skill.level || '');
    setEditSkillYears(skill.years?.toString() || '');
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingSkillId(null);
    setEditSkillLevel('');
    setEditSkillYears('');
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!handleUpdateSkill || editingSkillId === null) return;
    setIsEditSaving(true);
    setEditError(null);
    try {
      await handleUpdateSkill(editingSkillId, {
        level: editSkillLevel || undefined,
        years: editSkillYears ? parseInt(editSkillYears, 10) : undefined,
      });
      cancelEditing();
    } catch (error) {
      setEditError(formatErrorForDisplay(error, 'Failed to update skill'));
    } finally {
      setIsEditSaving(false);
    }
  };

  const skillLevelInput = (value: string, onChange: (v: string) => void) => (
    <div className="flex-1">
      <label className="block text-xs text-slate-500 mb-1 font-medium">
        Level
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">No level</option>
        {SKILL_LEVELS.map((lvl) => (
          <option key={lvl} value={lvl}>
            {formatLevel(lvl)}
          </option>
        ))}
      </select>
    </div>
  );

  const skillYearsInput = (value: string, onChange: (v: string) => void) => (
    <div className="w-24">
      <label className="block text-xs text-slate-500 mb-1 font-medium">
        Years
      </label>
      <input
        type="number"
        min={0}
        max={50}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <div className="rounded-[var(--radius-lg)] border bg-primary px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Skills
        </div>
        <div className="flex gap-2">
          {!isAdding && editingSkillId === null && (
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
          <div className="flex items-start gap-3">
            {skillLevelInput(newSkillLevel, setNewSkillLevel)}
            {skillYearsInput(newSkillYears, setNewSkillYears)}
          </div>
          {saveError && <p className="text-sm text-danger">{saveError}</p>}
          <div className="flex gap-2 mt-1">
            <button
              className="px-4 py-2 rounded bg-accent-solid text-white text-sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="px-4 py-2 rounded border text-sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-3 px-4">
        {skills.map((skill) =>
          editingSkillId === skill.id ? (
            <div
              key={skill.id}
              className="w-full flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="text-sm font-semibold text-slate-800">
                {skill.title}
              </div>
              <div className="flex items-start gap-3">
                {skillLevelInput(editSkillLevel, setEditSkillLevel)}
                {skillYearsInput(editSkillYears, setEditSkillYears)}
              </div>
              {editError && <p className="text-xs text-red-500">{editError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditSaving}
                  className="px-4 py-1.5 text-sm rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isEditSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={isEditSaving}
                  className="px-4 py-1.5 text-sm rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <span
              key={skill.id}
              className={`label-label-1-regular break-words px-3 py-1 rounded-[var(--radius-md)] border flex items-center gap-2 transition-colors ${
                handleUpdateSkill
                  ? 'cursor-pointer hover:border-indigo-300'
                  : ''
              } bg-[color:var(--bg-primary)] border-[color:var(--border-primary)] text-accent-primary`}
              onClick={() => handleUpdateSkill && startEditing(skill)}
            >
              <span>{skill.title}</span>
              {(skill.level ||
                (skill.years !== undefined && skill.years !== null)) && (
                <span className="text-[10px] opacity-75 leading-none">
                  (
                  {[
                    skill.level ? formatLevel(skill.level) : null,
                    skill.years !== undefined && skill.years !== null
                      ? `${skill.years}y`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  )
                </span>
              )}
              {handleDeleteSkill && (
                <button
                  className="text-danger hover:text-red-700 leading-none text-sm ml-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSkill(skill.id);
                  }}
                  aria-label={`Delete ${skill.title}`}
                  type="button"
                >
                  ×
                </button>
              )}
            </span>
          )
        )}
      </div>
    </div>
  );
}
