'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface SkillsProps {
  skills: string[];
  handleAddSkill?: (skill: string) => void;
  handleDeleteSkill?: (skill: string) => void;
}

export default function Skills({
  skills,
  handleAddSkill,
  handleDeleteSkill,
}: SkillsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
    setNewSkill('');
  };

  const handleSave = () => {
    if (handleAddSkill && newSkill.trim()) {
      handleAddSkill(newSkill.trim());
      setIsAdding(false);
      setNewSkill('');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewSkill('');
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Skills
        </div>
        <div className="flex gap-2">
          {!isAdding && (
            <button
              className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
              onClick={handleAddClick}
            >
              <Plus size={20} className="text-accent-primary" />
            </button>
          )}
        </div>
      </div>
      {isAdding && (
        <div className="flex flex-col gap-2 mt-2">
          <input
            className="body-body-1-regular text-primary break-words border rounded p-2 min-h-[40px]"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Nhập kỹ năng mới"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              className="px-4 py-2 rounded bg-accent-solid text-white"
              onClick={handleSave}
            >
              Lưu
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={handleCancel}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="label-label-1-regular bg-accent-primary text-accent-primary break-words px-3 py-1 rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] flex items-center gap-2"
          >
            {skill}
            {handleDeleteSkill && (
              <button
                className="ml-1 text-danger hover:underline"
                onClick={() => handleDeleteSkill(skill)}
                aria-label={`Xoá ${skill}`}
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
