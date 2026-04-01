'use client';

import React, { useState } from 'react';
import { Edit, Plus } from 'lucide-react';

interface SkillsProps {
  skills: string[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (skills: string[]) => void;
  onCancel?: () => void;
}

export default function Skills({
  skills,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
}: SkillsProps) {
  const [editSkills, setEditSkills] = useState(skills.join(', '));

  const handleSave = () => {
    if (onSave)
      onSave(
        editSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Skills
        </div>
        <div className="flex gap-2">
          <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
            <Plus size={20} className="text-accent-primary" />
          </button>
          <button
            className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
            onClick={onEdit}
          >
            <Edit size={20} className="text-accent-primary" />
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="body-body-1-regular text-primary break-words border rounded p-2 min-h-[60px]"
            value={editSkills}
            onChange={(e) => setEditSkills(e.target.value)}
            placeholder="Nhập kỹ năng, cách nhau bởi dấu phẩy"
          />
          <div className="flex gap-2 mt-2">
            <button
              className="px-4 py-2 rounded bg-accent-primary text-white"
              onClick={handleSave}
            >
              Lưu
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={onCancel || onEdit}
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="label-label-1-regular bg-accent-primary text-accent-primary break-words px-3 py-1 rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)]"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
