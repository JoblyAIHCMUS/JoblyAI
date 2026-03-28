import React from 'react';
import { Edit, MapPin, Flag } from 'lucide-react';

interface ProfileHeaderProps {
  candidate: {
    name: string;
    title: string;
    location: string;
    avatar: string;
    banner: string;
    openForOpportunities: boolean;
  };
}
export default function ProfileHeader({ candidate }: ProfileHeaderProps) {
  return (
    <div className="relative rounded-[10px] border border-[#CBD5E1] bg-white overflow-hidden flex flex-col items-end pb-6">
      <div className="w-full h-[140px] bg-[#4640DE]" />
      <div className="absolute left-8 top-[70px]">
        <div className="relative w-[140px] h-[140px]">
          <div className="absolute w-[140px] h-[140px] rounded-full bg-[#26A4FF] border-8 border-white" />
          <img
            src={candidate.avatar}
            alt="avatar"
            className="absolute w-[140px] h-[140px] rounded-full object-cover"
          />
        </div>
      </div>
      <button className="absolute right-6 top-6 p-2 rounded-[5px] border border-[#E2E8F0] bg-white hover:bg-gray-50">
        <span className="sr-only">Edit</span>
        <Edit size={24} />
      </button>
      <div className="w-full pl-[180px] pr-8 mt-6">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-semibold text-[#0F172A] font-['Lexend_Deca']">
              {candidate.name}
            </div>
            <div className="text-xl font-medium text-[#475569] font-['Lexend_Deca']">
              {candidate.title}
            </div>
            <div className="flex items-center gap-2 text-[#64748B] text-base font-normal">
              <MapPin size={16} />
              {candidate.location}
            </div>
            {candidate.openForOpportunities && (
              <div className="mt-2 px-6 py-3 bg-[#CCFBF1] rounded-lg flex items-center gap-2">
                <Flag size={16} color="#14B8A6" />
                <span className="text-[#14B8A6] font-semibold text-base">
                  OPEN FOR OPPORTUNITIES
                </span>
              </div>
            )}
          </div>
          <button className="px-6 py-3 rounded-[5px] border border-[#CBD5E1] text-[#4338CA] font-semibold text-base font-['Lexend_Deca'] hover:bg-[#EEF2FF]">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
