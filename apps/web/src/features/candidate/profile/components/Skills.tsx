'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CandidateSkill } from '@/api-client/candidate/types';
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewSkill('');
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
    } catch (error) {
      setSaveError(formatErrorForDisplay(error, 'Failed to add skill'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewSkill('');
    setSaveError(null);
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
          <input
            className="body-body-1-regular text-primary break-words border rounded p-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-accent-primary"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Enter a new skill"
            autoFocus
          />
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
