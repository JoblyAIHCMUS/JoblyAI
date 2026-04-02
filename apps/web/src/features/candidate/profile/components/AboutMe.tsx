'use client';

import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';

interface AboutMeProps {
  about: string[];
  handleUpdateAbout?: (about: string[]) => Promise<void>;
}

export default function AboutMe({ about, handleUpdateAbout }: AboutMeProps) {
  const [editValue, setEditValue] = useState(about.join('\n'));
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sync editValue with about prop when about changes
  useEffect(() => {
    if (!editing) {
      setEditValue(about.join('\n'));
    }
  }, [about, editing]);
  
  const handleSave = async () => {
    if (!handleUpdateAbout) return;
    setLoading(true);
    setError(null);
    try {
      await handleUpdateAbout(editValue.split('\n'));
      setEditing(false);
    } catch (err) {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-lg)] border bg-primary px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          About Me
        </div>
        <div className="flex gap-2">
          <button
            className="p-[var(--space-xs)] rounded-[var(--radius-md)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
            onClick={() => setEditing(true)}
          >
            <Edit size={16} className="text-accent-primary" />
          </button>
        </div>
      </div>
      {editing ? (
        <div className="flex flex-col gap-2 px-4">
          <textarea
            className="body-body-1-regular text-primary break-words border rounded p-2 min-h-[100px]"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={loading}
          />
          <div className="flex gap-2 mt-2">
            <button
              className={`px-4 py-2 rounded ${
                loading ? 'bg-accent-primary' : 'bg-accent-solid'
              }  text-white`}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setEditing(false)}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      ) : (
        about.map((line, idx) => (
          <div
            key={idx}
            className="body-body-1-regular text-primary break-words px-4"
          >
            {line}
          </div>
        ))
      )}
    </div>
  );
}
