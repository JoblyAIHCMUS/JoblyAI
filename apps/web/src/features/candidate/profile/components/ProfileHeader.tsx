import React from 'react';
import { Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Candidate {
  name: string;
  title: string;
  // location: string;
  avatar: string;
  banner: string;
  openForOpportunities: boolean;
}

interface ProfileHeaderProps {
  candidate: Candidate;
}

export default function ProfileHeader({ candidate }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] overflow-hidden flex flex-col items-end pb-[var(--space-xl)]">
      <div className="w-full h-[140px] bg-[color:#4640DE]" />
      <div className="absolute left-8 top-[70px]">
        <div className="relative w-[140px] h-[140px]">
          <div className="absolute w-[140px] h-[140px] rounded-full bg-[color:#26A4FF] border-[8px] border-[color:var(--bg-primary)]" />
          <img
            src={candidate.avatar}
            alt="avatar"
            className="absolute w-[140px] h-[140px] rounded-full object-cover"
          />
        </div>
      </div>
      <div className="w-full pl-[180px] pr-8 mt-6">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="heading-h5-semi-bold text-primary break-words">
              {candidate.name}
            </div>
            <div className="heading-h6-regular text-secondary break-words">
              {candidate.title}
            </div>
            {/* <div className="flex items-center gap-[var(--space-xs)] text-[color:var(--slate-500)] text-base font-normal">
              <MapPin size={20} />
              {candidate.location}
            </div> */}
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
  );
}
