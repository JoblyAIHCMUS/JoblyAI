'use client';
import React, { useState } from 'react';
import { Edit, Plus, Mail, Smartphone } from 'lucide-react';
import { Contact, Social } from '@/types/candidate';

interface SideBarProps {
  contact: Contact;
  socials: Social[];
  handleUpdateContact?: (contact: Contact) => void;
  handleAddSocial?: (social: Social) => void;
  handleUpdateSocials?: (social: Social[]) => void;
}

// Contact View
function ContactView({ contact }: { contact: Contact }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Additional Details
        </div>
        {/* Edit button disabled - users can edit from Settings page */}
      </div>
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
  );
}

// Contact Edit
function ContactEdit({
  editContact,
  onChange,
  onSave,
  onCancel,
}: {
  editContact: Contact;
  onChange: (field: keyof Contact, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Additional Details
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Mail size={24} className="text-accent-primary" />
        <div>
          <div className="label-label-1-medium text-secondary break-words">
            Email
          </div>
          <input
            className="body-body-1-regular text-tertiary break-words border rounded p-1"
            value={editContact.email}
            onChange={(e) => onChange('email', e.target.value)}
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
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Phone"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-2 rounded bg-accent-solid text-white"
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

// Socials View
function SocialsView({
  socials,
  onAdd,
  onEdit,
}: {
  socials: Social[];
  onAdd: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Social Links
        </div>
        <div className="flex gap-2">
          <button
            className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
            onClick={onAdd}
          >
            <Plus size={20} className="text-accent-primary" />
          </button>
          {socials.length > 0 && (
            <button
              className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]"
              onClick={onEdit}
            >
              <Edit size={20} className="text-accent-primary" />
            </button>
          )}
        </div>
      </div>
      {socials.map((s, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className="label-label-1-medium text-secondary break-words">
            {s.type}
          </span>
          <span className="body-body-1-regular text-tertiary break-words">
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
    <div className="flex flex-col items-start gap-4 mt-2">
      <input
        className="label-label-1-medium text-secondary break-words border rounded p-1 focus:outline-none focus:ring-2 focus:ring-accent-primary w-full"
        value={newSocial.type}
        onChange={(e) => onNewSocialChange('type', e.target.value)}
        placeholder="Type (e.g. Twitter)"
      />
      <input
        className="body-body-1-regular text-tertiary break-words border rounded p-1 focus:outline-none focus:ring-2 focus:ring-accent-primary w-full"
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
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Social Links
        </div>
      </div>
      {editSocials.map((s, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <input
            className="label-label-1-medium text-secondary break-words border rounded p-1"
            value={s.type}
            onChange={(e) => onSocialChange(idx, 'type', e.target.value)}
            placeholder="Type (e.g. Twitter)"
          />
          <input
            className="body-body-1-regular text-tertiary break-words border rounded p-1"
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
  contact,
  socials,
  handleUpdateContact,
  handleAddSocial,
  handleUpdateSocials,
}: SideBarProps) {
  // Contact state
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editContact, setEditContact] = useState<Contact>(contact);

  // Socials state
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [editSocials, setEditSocials] = useState<Social[]>(socials);
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [newSocial, setNewSocial] = useState<Social>({ type: '', url: '' });

  // Contact handlers
  const handleContactChange = (field: keyof Contact, value: string) => {
    setEditContact((prev) => ({ ...prev, [field]: value }));
  };
  const handleContactSave = () => {
    if (handleUpdateContact) handleUpdateContact(editContact);
    setIsEditingContact(false);
  };
  const handleContactCancel = () => {
    setIsEditingContact(false);
    setEditContact(contact);
  };

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
    <div className="flex flex-col gap-6 w-[375px]">
      {/* Additional Details */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-lg)] flex flex-col gap-[var(--space-lg)]">
        {isEditingContact ? (
          <ContactEdit
            editContact={editContact}
            onChange={handleContactChange}
            onSave={handleContactSave}
            onCancel={handleContactCancel}
          />
        ) : (
          <ContactView contact={contact} />
        )}
      </div>
      {/* Social Links */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-lg)] flex flex-col gap-[var(--space-lg)]">
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
            <SocialsView
              socials={socials}
              onAdd={() => setIsAddingSocial(true)}
              onEdit={handleSocialEdit}
            />
            {isAddingSocial && (
              <AddSocialForm
                newSocial={newSocial}
                onNewSocialChange={handleNewSocialChange}
                onSaveAddSocial={handleSaveAddSocial}
                onCancelAddSocial={handleCancelAddSocial}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
