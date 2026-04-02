'use client';
import React, { useState } from 'react';
import { Edit, Plus, Mail, Smartphone } from 'lucide-react';

interface Contact {
  email: string;
  phone: string;
}

interface Social {
  type: string;
  url: string;
}

interface SideBarProps {
  contact: Contact;
  socials: Social[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (contact: Contact, socials: Social[]) => void;
  onCancel?: () => void;
}

export default function SideBar({
  contact,
  socials,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
}: SideBarProps) {
  const [editContact, setEditContact] = useState<Contact>(contact);
  const [editSocials, setEditSocials] = useState<Social[]>(socials);

  const handleContactChange = (field: keyof Contact, value: string) => {
    setEditContact((c) => ({ ...c, [field]: value }));
  };
  const handleSocialChange = (
    idx: number,
    field: keyof Social,
    value: string
  ) => {
    setEditSocials((list) =>
      list.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };
  const handleSave = () => {
    if (onSave) onSave(editContact, editSocials);
  };

  return (
    <div className="flex flex-col gap-6 w-[375px]">
      {/* Additional Details */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-lg)] flex flex-col gap-[var(--space-lg)]">
        <div className="flex items-center justify-between">
          <div className="heading-h6-semi-bold text-primary break-words">
            Additional Details
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
          <>
            <div className="flex items-center gap-4">
              <Mail size={24} className="text-accent-primary" />
              <div>
                <div className="label-label-1-medium text-secondary break-words">
                  Email
                </div>
                <input
                  className="body-body-1-regular text-tertiary break-words border rounded p-1"
                  value={editContact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="Email"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Smartphone size={24} className="text-accent-primary" />
              <div>
                <div className="label-label-1-medium text-secondary break-words">
                  Phone
                </div>
                <input
                  className="body-body-1-regular text-tertiary break-words border rounded p-1"
                  value={editContact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  placeholder="Phone"
                />
              </div>
            </div>
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
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Mail size={24} className="text-accent-primary" />
              <div>
                <div className="label-label-1-medium text-secondary break-words">
                  Email
                </div>
                <div className="body-body-1-regular text-tertiary break-words">
                  {contact.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Smartphone size={24} className="text-accent-primary" />
              <div>
                <div className="label-label-1-medium text-secondary break-words">
                  Phone
                </div>
                <div className="body-body-1-regular text-tertiary break-words">
                  {contact.phone}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Social Links */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-lg)] flex flex-col gap-[var(--space-lg)]">
        <div className="flex items-center justify-between">
          <div className="heading-h6-semi-bold text-primary break-words">
            Social Links
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
          <>
            {editSocials.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <input
                  className="label-label-1-medium text-secondary break-words border rounded p-1"
                  value={s.type}
                  onChange={(e) =>
                    handleSocialChange(idx, 'type', e.target.value)
                  }
                  placeholder="Type (e.g. Twitter)"
                />
                <input
                  className="body-body-1-regular text-tertiary break-words border rounded p-1"
                  value={s.url}
                  onChange={(e) =>
                    handleSocialChange(idx, 'url', e.target.value)
                  }
                  placeholder="URL"
                />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button
                className="px-4 py-2 rounded bg-accent-primary text-white"
                onClick={handleSave}
              >
                Lưu
              </button>
              <button className="px-4 py-2 rounded border" onClick={onEdit}>
                Hủy
              </button>
            </div>
          </>
        ) : (
          <>
            {socials.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4">
                {/* ... */}
                <span className="label-label-1-medium text-secondary break-words">
                  {s.type}
                </span>
                <span className="body-body-1-regular text-tertiary break-words">
                  {s.url}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
