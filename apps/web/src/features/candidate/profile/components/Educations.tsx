'use client';

import { useState } from 'react';
import { Edit, Plus } from 'lucide-react';

interface Education {
  logo: string;
  school: string;
  degree: string;
  time: string;
  desc: string;
}

interface EducationsProps {
  educations: Education[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (educations: Education[]) => void;
  onCancel?: () => void;
}

export default function Educations({
  educations,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
}: EducationsProps) {
  const [editList, setEditList] = useState<Education[]>(educations);

  const handleChange = (idx: number, field: keyof Education, value: string) => {
    setEditList((list) =>
      list.map((edu, i) => (i === idx ? { ...edu, [field]: value } : edu))
    );
  };

  const handleSave = () => {
    if (onSave) onSave(editList);
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] px-[var(--space-xs2)] py-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Educations
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
        <div className="flex flex-col gap-4">
          {editList.map((edu, idx) => (
            <div key={idx} className="flex flex-row gap-6 px-6 py-4">
              <input
                className="w-20 h-20 rounded-[var(--radius-xl)] object-cover border"
                value={edu.logo}
                onChange={(e) => handleChange(idx, 'logo', e.target.value)}
                placeholder="Logo URL"
              />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <input
                    className="heading-h6-semi-bold text-primary break-words border rounded p-1"
                    value={edu.school}
                    onChange={(e) =>
                      handleChange(idx, 'school', e.target.value)
                    }
                    placeholder="School"
                  />
                  <button
                    className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
                    onClick={onEdit}
                  >
                    <Edit size={20} className="text-accent-primary" />
                  </button>
                </div>
                <input
                  className="body-body-1-regular text-secondary break-words border rounded p-1"
                  value={edu.degree}
                  onChange={(e) => handleChange(idx, 'degree', e.target.value)}
                  placeholder="Degree"
                />
                <input
                  className="body-body-1-regular text-secondary break-words border rounded p-1"
                  value={edu.time}
                  onChange={(e) => handleChange(idx, 'time', e.target.value)}
                  placeholder="Time"
                />
                <textarea
                  className="body-body-1-regular text-primary break-words border rounded p-1"
                  value={edu.desc}
                  onChange={(e) => handleChange(idx, 'desc', e.target.value)}
                  placeholder="Description"
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2 px-6">
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
        <>
          {educations.map((edu, idx) => (
            <div key={idx} className="flex flex-row gap-6 px-6 py-4">
              <img
                src={edu.logo}
                alt={edu.school}
                className="w-20 h-20 rounded-[var(--radius-xl)] object-cover"
              />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <div className="heading-h6-semi-bold text-primary break-words">
                    {edu.school}
                  </div>
                  <button
                    className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
                    onClick={onEdit}
                  >
                    <Edit size={20} className="text-accent-primary" />
                  </button>
                </div>
                <div className="body-body-1-regular text-secondary break-words">
                  {edu.degree}
                </div>
                <div className="body-body-1-regular text-secondary break-words">
                  {edu.time}
                </div>
                <div className="body-body-1-regular text-primary break-words">
                  {edu.desc}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
      <div className="flex justify-end px-6">
        <span className="label-label-1-semi-bold text-accent-primary cursor-pointer break-words">
          Show 2 more educations
        </span>
      </div>
    </div>
  );
}
