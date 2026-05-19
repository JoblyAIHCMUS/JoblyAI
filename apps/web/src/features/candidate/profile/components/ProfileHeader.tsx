import React from 'react';
import { Flag, Mail, Smartphone, Edit, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SideBar from './sideBar';
import type { CandidateSocial, CandidateContact } from '@/types/candidate';

interface Candidate {
  name: string;
  title: string;
  avatar: string;
  banner: string;
  openForOpportunities: boolean;
  email?: string;
  phone?: string;
  socials: CandidateSocial[];
  contacts: CandidateContact[];
}

interface ProfileHeaderProps {
  candidate: Candidate;
  handleAddSocial?: (social: CandidateSocial) => Promise<void> | void;
  handleUpdateSocials?: (socials: CandidateSocial[]) => Promise<void> | void;
  handleDeleteSocial?: (id: number) => Promise<void> | void;
  handleAddContact?: (contact: CandidateContact) => Promise<void> | void;
  handleUpdateContacts?: (contacts: CandidateContact[]) => Promise<void> | void;
  handleDeleteContact?: (id: number) => Promise<void> | void;
}

export default function ProfileHeader({
  candidate,
  handleAddSocial,
  handleUpdateSocials,
  handleDeleteSocial,
  handleAddContact,
  handleUpdateContacts,
  handleDeleteContact,
  handleUpdateAbout,
  descriptionId, // Add this to receive the ID from page.tsx
}: ProfileHeaderProps & {
  handleUpdateAbout?: (aboutData: {
    id: number;
    title?: string;
    bio?: string;
  }) => Promise<void>;
  descriptionId?: number;
}) {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [title, setTitle] = React.useState(candidate.title || '');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setTitle(candidate.title || '');
  }, [candidate.title]);

  const handleSaveTitle = async () => {
    if (!handleUpdateAbout) return;
    setLoading(true);
    try {
      await handleUpdateAbout({
        id: descriptionId || 0, // Pass the correct ID
        title,
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update title:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row w-full gap-[var(--space-base)] items-stretch">
      {/* Left side: 3/5 */}
      <div className="flex-[3] relative rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] overflow-hidden flex flex-col items-end pb-[var(--space-xl)]">
        <div className="w-full h-[140px] bg-[color:#4640DE]" />
        <div className="absolute left-8 top-[70px]">
          <div className="relative w-[140px] h-[140px]">
            <div className="absolute w-[140px] h-[140px] rounded-full bg-[color:#26A4FF] border-[8px] border-[color:var(--bg-primary)]" />
            {candidate.avatar ? (
              <img
                src={candidate.avatar}
                alt="avatar"
                className="absolute w-[140px] h-[140px] rounded-full object-cover"
              />
            ) : null}
          </div>
        </div>
        <div className="w-full pl-[180px] pr-8 mt-6">
          <div className="flex flex-row justify-between items-start">
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="heading-h5-semi-bold text-primary break-words">
                {candidate.name}
              </div>

              {isEditingTitle ? (
                <div className="flex flex-col gap-2 mt-1">
                  <input
                    type="text"
                    className="heading-h6-regular text-secondary border-b border-accent-primary outline-none bg-transparent w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTitle}
                      disabled={loading}
                      className="px-3 py-1 rounded-md bg-accent-solid text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTitle(false);
                        setTitle(candidate.title);
                      }}
                      className="px-3 py-1 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <div className="heading-h6-regular text-secondary break-words">
                    {candidate.title || 'Add Professional Title'}
                  </div>
                  <Edit
                    size={14}
                    className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 mt-2">
                {candidate.email && (
                  <div className="flex items-center gap-2">
                    <Mail
                      size={16}
                      className="text-accent-primary flex-shrink-0"
                    />
                    <span className="body-body-1-regular text-tertiary break-words">
                      {candidate.email}
                    </span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Smartphone
                      size={16}
                      className="text-accent-primary flex-shrink-0"
                    />
                    <span className="body-body-1-regular text-tertiary break-words">
                      {candidate.phone}
                    </span>
                  </div>
                )}
              </div>
              {candidate.openForOpportunities && (
                <div className="mt-2 px-[var(--space-xl)] py-[var(--space-base)] bg-[color:#CCFBF1] rounded-[var(--radius-xl)] flex items-center gap-[var(--space-xs)]">
                  <Flag size={20} color="#14B8A6" />
                  <span className="text-[var(--teal-500)] body-body-1-medium break-words">
                    OPEN FOR OPPORTUNITIES
                  </span>
                </div>
              )}
            </div>
            <button
              className="text-accent-primary px-[var(--space-xs)] py-[var(--space-base)] rounded-[var(--radius-md)] label-label-1-semi-bold hover:bg-[color:var(--indigo-50)]"
              onClick={() => router.push('/candidate/settings')}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      {/* Right side: 2/5 - SideBar (Contacts & Social Links) */}
      <div className="flex-[2] rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] overflow-hidden">
        <div className="h-full p-[var(--space-md)]">
          <SideBar
            socials={candidate.socials || []}
            handleAddSocial={handleAddSocial}
            handleUpdateSocials={handleUpdateSocials}
            handleDeleteSocial={handleDeleteSocial}
            contacts={candidate.contacts || []}
            handleAddContact={handleAddContact}
            handleUpdateContacts={handleUpdateContacts}
            handleDeleteContact={handleDeleteContact}
          />
        </div>
      </div>
    </div>
  );
}
