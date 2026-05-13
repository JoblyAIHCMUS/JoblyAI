'use client';

import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';

interface AboutMeProps {
  about: {
    id?: number;
    bio?: string;
    title?: string;
  };
  handleUpdateAbout?: (aboutData: {
    id: number;
    bio?: string;
    title?: string;
  }) => Promise<void>;
}

export default function AboutMe({ about, handleUpdateAbout }: AboutMeProps) {
  const [bio, setBio] = useState(about.bio || '');
  const [title, setTitle] = useState(about.title || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with about prop when it changes
  useEffect(() => {
    if (!editing) {
      setBio(about.bio || '');
      setTitle(about.title || '');
    }
  }, [about, editing]);

  const handleSave = async () => {
    if (!handleUpdateAbout) return;
    setLoading(true);
    setError(null);
    try {
      await handleUpdateAbout({
        id: about.id || 0,
        bio,
        title,
      });
      setEditing(false);
    } catch {
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
          {!editing && (
            <button
              className="p-[var(--space-xs)] rounded-[var(--radius-md)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
              onClick={() => setEditing(true)}
            >
              <Edit size={16} className="text-accent-primary" />
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <label className="label-label-1-semi-bold text-primary">Professional Title</label>
            <input
              type="text"
              className="body-body-1-regular text-primary border rounded p-2"
              placeholder="e.g. Senior Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="label-label-1-semi-bold text-primary">Biography</label>
            <textarea
              className="body-body-1-regular text-primary break-words border rounded p-2 min-h-[150px] resize-none"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className={`px-4 py-2 rounded ${
                loading ? 'bg-accent-primary' : 'bg-accent-solid'
              }  text-white`}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setEditing(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-4">
          {bio ? (
            <div className="body-body-1-regular text-primary break-words whitespace-pre-wrap">
              {bio}
            </div>
          ) : (
            <div className="body-body-1-regular text-tertiary break-words italic">
              No about information yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
