import React from 'react';
import { Flag, Mail, Smartphone, Edit } from 'lucide-react';
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
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handleAvatarClick = () => {
    if (candidate.avatar) {
      setIsPreviewOpen(true);
    } else {
      router.push('/candidate/settings');
    }
  };

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
        <div className="w-full h-[140px] bg-gradient-to-r from-indigo-600 to-violet-600" />
        <div className="absolute left-8 top-[70px]">
          <div
            className="relative w-[140px] h-[140px] cursor-pointer group/avatar hover:scale-105 transition-all duration-300 select-none"
            onClick={handleAvatarClick}
            title={
              candidate.avatar
                ? 'Click to view avatar'
                : 'Click to upload avatar'
            }
          >
            <div className="absolute inset-0 rounded-full bg-slate-100 border-[8px] border-[color:var(--bg-primary)] flex items-center justify-center overflow-hidden shadow-sm group-hover/avatar:shadow-md transition-shadow">
              <img
                src={candidate.avatar || 'https://placehold.co/124x124'}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-[8px] rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
              {candidate.avatar ? 'View' : 'Upload'}
            </div>
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
      {isPreviewOpen && candidate.avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={candidate.avatar}
              alt="avatar preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain shadow-2xl border-4 border-white"
            />
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
