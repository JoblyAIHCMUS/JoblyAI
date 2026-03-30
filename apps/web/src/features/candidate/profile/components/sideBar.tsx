'use client';
import React from 'react';
import { Edit, Plus, Mail, Smartphone } from 'lucide-react';
import { FaInstagram, FaTwitter, FaGlobe } from 'react-icons/fa';

export default function SideBar({
  contact,
  socials,
}: {
  contact: any;
  socials: any[];
}) {

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
              <Plus size={20} className='text-accent-primary' />
            </button>
            <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
              <Edit size={20} className='text-accent-primary' />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Mail size={24} className='text-accent-primary' />
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
          <Smartphone size={24} className='text-accent-primary' />
          <div>
            <div className="label-label-1-medium text-secondary break-words">
              Phone
            </div>
            <div className="body-body-1-regular text-tertiary break-words">
              {contact.phone}
            </div>
          </div>
        </div>
      </div>
      {/* Social Links */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-lg)] flex flex-col gap-[var(--space-lg)]">
        <div className="flex items-center justify-between">
          <div className="heading-h6-semi-bold text-primary break-words">
            Social Links
          </div>
          <div className="flex gap-2">
            <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
              <Plus size={20} className='text-accent-primary' />
            </button>
            <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
              <Edit size={20} className='text-accent-primary' />
            </button>
          </div>
        </div>
        {socials.map((s, idx) => (
          <div key={idx} className="flex items-center gap-4">
            {s.label === 'Instagram' && (<FaInstagram size={24} color="#E1306C" />)}
            {s.label === 'Twitter' && <FaTwitter size={24} color="#1DA1F2" />}
            {s.label === 'Website' && <FaGlobe size={24} color="#4A90E2" />}
            <div>
              <div className="label-label-1-medium text-secondary break-words">
                {s.label}
              </div>
              <div className="body-body-1-regular text-accent-primary break-words cursor-pointer">
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
