'use client';
import React, { useState } from 'react';
import { Edit, Plus } from 'lucide-react';
import { Social } from '@/types/candidate';

interface SideBarProps {
  contact?: { email: string; phone?: string };
  socials: Social[];
  handleUpdateContact?: (contact: { email: string; phone?: string }) => void;
  handleAddSocial?: (social: Social) => void;
  handleUpdateSocials?: (social: Social[]) => void;
}

// Socials View
function SocialsView({ socials }: { socials: Social[] }) {
  return (
    <>
      {socials.map((s, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className="label-label-2-regular text-tertiary p-1 break-words">
            {s.type}
          </span>
          <span className="label-label-2-regular text-tertiary p-1 break-words">
            {s.url}
          </span>
        </div>
      ))}
    </>
  );
}

// Add Social Form
function AddSocialForm({
  newSocial,
  onNewSocialChange,
  onSaveAddSocial,
  onCancelAddSocial,
}: {
  newSocial: Social;
  onNewSocialChange: (field: keyof Social, value: string) => void;
  onSaveAddSocial: () => void;
  onCancelAddSocial: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 mt-2">
      <input
        className="label-label-2-regular text-tertiary break-words border rounded p-1 focus:outline-none focus:ring-2 focus:ring-accent-primary w-full"
        value={newSocial.type}
        onChange={(e) => onNewSocialChange('type', e.target.value)}
        placeholder="Type (e.g. Twitter)"
      />
      <input
        className="label-label-2-regular text-tertiary break-words border rounded p-1 focus:outline-none focus:ring-2 focus:ring-accent-primary w-full"
        value={newSocial.url}
        onChange={(e) => onNewSocialChange('url', e.target.value)}
        placeholder="URL"
      />
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded bg-accent-solid text-white"
          onClick={onSaveAddSocial}
        >
          Save
        </button>
        <button
          className="px-4 py-2 rounded border"
          onClick={onCancelAddSocial}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Edit Socials Form
function EditSocialsForm({
  editSocials,
  onSocialChange,
  onDeleteSocial,
  onSave,
  onCancel,
}: {
  editSocials: Social[];
  onSocialChange: (idx: number, field: keyof Social, value: string) => void;
  onDeleteSocial: (idx: number) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      {editSocials.map((s, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <input
            className="label-label-2-regular text-tertiary break-words border rounded p-1"
            value={s.type}
            onChange={(e) => onSocialChange(idx, 'type', e.target.value)}
            placeholder="Type (e.g. Twitter)"
          />
          <input
            className="label-label-2-regular text-tertiary break-words border rounded p-1"
            value={s.url}
            onChange={(e) => onSocialChange(idx, 'url', e.target.value)}
            placeholder="URL"
          />
          <button
            className="ml-1 text-danger hover:underline"
            onClick={() => onDeleteSocial(idx)}
            aria-label={`Xoá ${s.type}`}
          >
            ×
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-2 rounded bg-accent-primary text-white"
          onClick={onSave}
        >
          Save
        </button>
        <button className="px-4 py-2 rounded border" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  );
}

export default function SideBar({
  socials,
  handleAddSocial,
  handleUpdateSocials,
}: SideBarProps) {
  // Socials state
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [editSocials, setEditSocials] = useState<Social[]>(socials);
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [newSocial, setNewSocial] = useState<Social>({ type: '', url: '' });

  // Social handlers
  const handleSocialChange = (
    idx: number,
    field: keyof Social,
    value: string
  ) => {
    setEditSocials((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };
  const handleSocialEdit = () => {
    setIsEditingSocial(true);
    setEditSocials(socials);
  };
  const handleSocialSave = () => {
    if (handleUpdateSocials) handleUpdateSocials(editSocials);
    setIsEditingSocial(false);
  };
  const handleSocialCancel = () => {
    setIsEditingSocial(false);
    setEditSocials(socials);
  };
  const handleSaveAddSocial = () => {
    if (handleAddSocial && newSocial.type.trim() && newSocial.url.trim()) {
      handleAddSocial(newSocial);
    }
    setIsAddingSocial(false);
    setNewSocial({ type: '', url: '' });
  };
  const handleCancelAddSocial = () => {
    setIsAddingSocial(false);
    setNewSocial({ type: '', url: '' });
  };
  const handleDeleteSocial = (idx: number) => {
    setEditSocials((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleNewSocialChange = (field: keyof Social, value: string) => {
    setNewSocial((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col w-full">
      {/* Social Links */}
      <div className="rounded-[var(--radius-lg)] bg-[color:var(--bg-primary)] flex flex-col">
        <div className="flex items-center justify-between">
          <div className="heading-h6-semi-bold text-primary break-words p-1">
            Social Links
          </div>
          <div className="flex gap-2">
            <button
              className="p-[var(--space-xs)] rounded-[var(--radius-md)]  bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
              onClick={() => setIsAddingSocial(true)}
            >
              <Plus size={16} className="text-accent-primary" />
            </button>
            {socials.length > 0 && (
              <button
                className="p-[var(--space-xs)] rounded-[var(--radius-md)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
                onClick={handleSocialEdit}
              >
                <Edit size={16} className="text-accent-primary" />
              </button>
            )}
          </div>
        </div>
        {isAddingSocial && (
          <AddSocialForm
            newSocial={newSocial}
            onNewSocialChange={handleNewSocialChange}
            onSaveAddSocial={handleSaveAddSocial}
            onCancelAddSocial={handleCancelAddSocial}
          />
        )}
        {isEditingSocial ? (
          <EditSocialsForm
            editSocials={editSocials}
            onSocialChange={handleSocialChange}
            onDeleteSocial={handleDeleteSocial}
            onSave={handleSocialSave}
            onCancel={handleSocialCancel}
          />
        ) : (
          <>
            <SocialsView socials={socials} />
          </>
        )}
      </div>
    </div>
  );
}
