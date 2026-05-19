'use client';
import React, { useState } from 'react';
import {
  Edit,
  Plus,
  Trash,
  Trash2,
  Globe,
  Github,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  Smartphone,
  Check,
  X,
  Star,
} from 'lucide-react';
import type { CandidateSocial, CandidateContact } from '@/types/candidate';
import { cn } from '@/lib/utils';
import ConfirmDelete from '@/components/ui/confirmDelete';

interface SideBarProps {
  socials: CandidateSocial[];
  handleAddSocial?: (social: CandidateSocial) => Promise<void> | void;
  handleUpdateSocials?: (socials: CandidateSocial[]) => Promise<void> | void;
  handleDeleteSocial?: (id: number) => Promise<void> | void;

  contacts: CandidateContact[];
  handleAddContact?: (contact: CandidateContact) => Promise<void> | void;
  handleUpdateContacts?: (contacts: CandidateContact[]) => Promise<void> | void;
  handleDeleteContact?: (id: number) => Promise<void> | void;
}

const PLATFORM_ICONS: Record<string, any> = {
  LINKEDIN: Linkedin,
  GITHUB: Github,
  FACEBOOK: Facebook,
  TWITTER: Twitter,
  INSTAGRAM: Instagram,
  YOUTUBE: Youtube,
  OTHER: Globe,
};

const CONTACT_ICONS: Record<string, any> = {
  EMAIL: Mail,
  PHONE: Phone,
  MOBILE: Smartphone,
  OTHER: Globe,
};

const PLATFORMS = [
  'LINKEDIN',
  'GITHUB',
  'FACEBOOK',
  'TWITTER',
  'INSTAGRAM',
  'YOUTUBE',
  'DRIBBBLE',
  'BEHANCE',
  'TIKTOK',
  'OTHER',
];

const CONTACT_TYPES = ['EMAIL', 'PHONE', 'MOBILE', 'OTHER'];

// --- SUB-COMPONENTS ---

function SectionHeader({
  title,
  onAdd,
  onManage,
  isActive,
  hasItems,
}: {
  title: string;
  onAdd: () => void;
  onManage: () => void;
  isActive: boolean;
  hasItems: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-['Lexend_Deca']">
        {title}
      </h3>
      <div className="flex gap-1">
        <button
          onClick={onAdd}
          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-accent-primary transition-all"
        >
          <Plus size={14} />
        </button>
        {hasItems && (
          <button
            onClick={onManage}
            className={cn(
              'p-1 rounded-md transition-all',
              isActive
                ? 'text-accent-primary bg-accent-primary/10'
                : 'text-slate-400 hover:bg-slate-100'
            )}
          >
            <Edit size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function SideBar({
  socials = [],
  handleAddSocial,
  handleUpdateSocials,
  handleDeleteSocial,
  contacts = [],
  handleAddContact,
  handleUpdateContacts,
  handleDeleteContact,
}: SideBarProps) {
  // State for Socials
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [isEditingSocialMode, setIsEditingSocialMode] = useState(false);
  const [editingSocial, setEditingSocial] = useState<CandidateSocial | null>(
    null
  );

  // State for Contacts
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContactMode, setIsEditingContactMode] = useState(false);
  const [editingContact, setEditingContact] = useState<CandidateContact | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<{
    id: number;
    type: 'social' | 'contact';
  } | null>(null);

  // Handlers for Social
  const onSocialSubmit = async (data: CandidateSocial) => {
    setLoading(true);
    try {
      if (editingSocial) {
        await handleUpdateSocials?.([data]);
        setEditingSocial(null);
      } else {
        await handleAddSocial?.(data);
        setIsAddingSocial(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Contact
  const onContactSubmit = async (data: CandidateContact) => {
    setLoading(true);
    try {
      if (editingContact) {
        await handleUpdateContacts?.([data]);
        setEditingContact(null);
      } else {
        await handleAddContact?.(data);
        setIsAddingContact(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      if (deleteId.type === 'social') {
        await handleDeleteSocial?.(deleteId.id);
      } else {
        await handleDeleteContact?.(deleteId.id);
      }
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-8">
      {/* CONTACT INFO SECTION */}
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Contact Info"
          onAdd={() => {
            setIsAddingContact(true);
            setEditingContact(null);
          }}
          onManage={() => {
            setIsEditingContactMode(!isEditingContactMode);
            setEditingContact(null);
          }}
          isActive={isEditingContactMode}
          hasItems={contacts.length > 0}
        />

        {(isAddingContact || editingContact) && (
          <ContactForm
            initialData={
              editingContact || { type: 'EMAIL', value: '', isPrimary: false }
            }
            onSubmit={onContactSubmit}
            onCancel={() => {
              setIsAddingContact(false);
              setEditingContact(null);
            }}
            loading={loading}
          />
        )}

        {isEditingContactMode ? (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {contacts.map((c) => (
              <EditRow
                key={c.id}
                icon={CONTACT_ICONS[c.type || 'OTHER'] || Globe}
                label={c.type || 'OTHER'}
                value={c.value}
                isPrimary={c.isPrimary}
                onEdit={() => {
                  setEditingContact(c);
                  setIsAddingContact(false);
                }}
                onDelete={() => setDeleteId({ id: c.id, type: 'contact' })}
              />
            ))}
          </div>
        ) : (
          !isAddingContact &&
          !editingContact && (
            <div className="flex flex-col gap-3 px-1">
              {contacts.map((c, idx) => {
                const Icon = CONTACT_ICONS[c.type || 'OTHER'] || Globe;
                return (
                  <div
                    key={c.id || idx}
                    className="flex items-center gap-3 group"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-accent-primary/10 group-hover:text-accent-primary transition-colors">
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                          {c.type || 'CONTACT'}
                        </span>
                        {c.isPrimary && (
                          <Badge className="bg-blue-50 text-blue-600 text-[8px] h-3 px-1 border-blue-100 uppercase font-black">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-primary truncate">
                        {c.value}
                      </span>
                    </div>
                  </div>
                );
              })}
              {contacts.length === 0 && (
                <p className="text-[10px] text-slate-400 italic px-2">
                  No contact info provided.
                </p>
              )}
            </div>
          )
        )}
      </div>

      {/* SOCIAL LINKS SECTION */}
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Social Links"
          onAdd={() => {
            setIsAddingSocial(true);
            setEditingSocial(null);
          }}
          onManage={() => {
            setIsEditingSocialMode(!isEditingSocialMode);
            setEditingSocial(null);
          }}
          isActive={isEditingSocialMode}
          hasItems={socials.length > 0}
        />

        {(isAddingSocial || editingSocial) && (
          <SocialForm
            initialData={editingSocial || { platform: 'LINKEDIN', url: '' }}
            onSubmit={onSocialSubmit}
            onCancel={() => {
              setIsAddingSocial(false);
              setEditingSocial(null);
            }}
            loading={loading}
          />
        )}

        {isEditingSocialMode ? (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {socials.map((s) => (
              <EditRow
                key={s.id}
                icon={PLATFORM_ICONS[s.platform] || Globe}
                label={s.platform}
                value={s.url}
                onEdit={() => {
                  setEditingSocial(s);
                  setIsAddingSocial(false);
                }}
                onDelete={() => setDeleteId({ id: s.id, type: 'social' })}
              />
            ))}
          </div>
        ) : (
          !isAddingSocial &&
          !editingSocial && (
            <div className="flex flex-col gap-3 px-1">
              {socials.map((s, idx) => {
                const Icon = PLATFORM_ICONS[s.platform] || Globe;
                return (
                  <div
                    key={s.id || idx}
                    className="flex items-center gap-3 group"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-accent-primary/10 group-hover:text-accent-primary transition-colors">
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        {s.platform}
                      </span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary truncate hover:text-accent-primary hover:underline underline-offset-2 transition-all"
                      >
                        {s.url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                );
              })}
              {socials.length === 0 && (
                <p className="text-[10px] text-slate-400 italic px-2">
                  No social links provided.
                </p>
              )}
            </div>
          )
        )}
      </div>

      {deleteId !== null && (
        <ConfirmDelete
          title={`Remove ${
            deleteId.type === 'social' ? 'Social Link' : 'Contact Info'
          }`}
          description={`Are you sure you want to disconnect this ${deleteId.type} from your profile?`}
          onCancel={() => setDeleteId(null)}
          onConfirm={onDeleteConfirm}
          loading={loading}
        />
      )}
    </div>
  );
}

// --- SHARED UI HELPERS ---

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        className
      )}
    >
      {children}
    </span>
  );
}

function EditRow({
  icon: Icon,
  label,
  value,
  onEdit,
  onDelete,
  isPrimary,
}: any) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-100 rounded-xl group hover:border-accent-primary/30 transition-all shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-accent-primary transition-colors">
          <Icon size={14} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">
              {label}
            </span>
            {isPrimary && <div className="w-1 h-1 rounded-full bg-blue-500" />}
          </div>
          <span className="text-xs font-semibold text-slate-700 truncate">
            {value}
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="p-1 text-slate-300 hover:text-accent-primary hover:bg-accent-primary/5 rounded-md transition-all"
        >
          <Edit size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
        >
          <Trash size={12} />
        </button>
      </div>
    </div>
  );
}

function SocialForm({ initialData, onSubmit, onCancel, loading }: any) {
  const [data, setData] = useState(initialData);
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
      <select
        className="text-xs font-bold border rounded-md p-2 bg-white focus:ring-2 focus:ring-accent-primary outline-none"
        value={data.platform}
        onChange={(e) => setData({ ...data, platform: e.target.value })}
      >
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <input
        className="text-xs font-medium border rounded-md p-2 bg-white focus:ring-2 focus:ring-accent-primary outline-none"
        value={data.url}
        onChange={(e) => setData({ ...data, url: e.target.value })}
        placeholder="URL (https://...)"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(data)}
          disabled={loading || !data.url}
          className="flex-1 py-1.5 bg-accent-solid text-white text-[10px] font-bold rounded-md hover:bg-accent-hover transition-all"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 border bg-white text-slate-500 text-[10px] font-bold rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ContactForm({ initialData, onSubmit, onCancel, loading }: any) {
  const [data, setData] = useState(initialData);
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
      <select
        className="text-xs font-bold border rounded-md p-2 bg-white focus:ring-2 focus:ring-accent-primary outline-none"
        value={data.type}
        onChange={(e) => setData({ ...data, type: e.target.value })}
      >
        {CONTACT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input
        className="text-xs font-medium border rounded-md p-2 bg-white focus:ring-2 focus:ring-accent-primary outline-none"
        value={data.value}
        onChange={(e) => setData({ ...data, value: e.target.value })}
        placeholder={
          data.type === 'EMAIL' ? 'email@example.com' : 'Phone number'
        }
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={data.isPrimary}
          onChange={(e) => setData({ ...data, isPrimary: e.target.checked })}
          className="w-3 h-3 text-accent-primary"
        />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          Set as primary contact
        </span>
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(data)}
          disabled={loading || !data.value}
          className="flex-1 py-1.5 bg-accent-solid text-white text-[10px] font-bold rounded-md hover:bg-accent-hover transition-all"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 border bg-white text-slate-500 text-[10px] font-bold rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
