'use client';
import React from 'react';
import { Edit, Mail, Smartphone } from 'lucide-react';
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
      <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">
            Additional Details
          </div>
          <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
            <Edit size={20} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Mail size={24} />
          <div>
            <div className="text-[#64748B] text-base font-['Lexend_Deca']">
              Email
            </div>
            <div className="text-[#0F172A] text-base font-['Be_Vietnam_Pro']">
              {contact.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Smartphone size={24} />
          <div>
            <div className="text-[#64748B] text-base font-['Lexend_Deca']">
              Phone
            </div>
            <div className="text-[#0F172A] text-base font-['Be_Vietnam_Pro']">
              {contact.phone}
            </div>
          </div>
        </div>
      </div>
      {/* Social Links */}
      <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">
            Social Links
          </div>
          <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
            <Edit size={20} />
          </button>
        </div>
        {socials.map((s, idx) => (
          <div key={idx} className="flex items-center gap-4">
            {s.label === 'Instagram' && (
              <FaInstagram size={24} color="#E1306C" />
            )}
            {s.label === 'Twitter' && <FaTwitter size={24} color="#1DA1F2" />}
            {s.label === 'Website' && <FaGlobe size={24} color="#4A90E2" />}
            <div>
              <div className="text-[#64748B] text-base font-['Lexend_Deca']">
                {s.label}
              </div>
              <div className="text-[#4338CA] text-base font-['Be_Vietnam_Pro']">
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
