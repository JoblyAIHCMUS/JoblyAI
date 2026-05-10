'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Briefcase, GraduationCap, Code2, Award, Share2, Phone, User, Info } from 'lucide-react';

interface CvSyncCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: any;
  newData: any;
  onSync: () => Promise<void>;
  isLoading?: boolean;
}

export function CvSyncCompareModal({
  isOpen,
  onClose,
  currentData,
  newData,
  onSync,
  isLoading = false,
}: CvSyncCompareModalProps) {
  const renderSectionHeader = (icon: React.ReactNode, title: string, count?: number) => (
    <div className="flex items-center justify-between mb-3 border-b pb-1">
      <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
        {icon} {title}
      </h3>
      {count !== undefined && (
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
          {count} items
        </Badge>
      )}
    </div>
  );

  const Section = ({ icon, title, current, newItems, renderItem, renderNewItem }: any) => (
    <section className="mb-8 last:mb-0">
      <div className="flex gap-6">
        {/* Left Side: Current */}
        <div className="w-1/2">
          {renderSectionHeader(icon, title, current?.length)}
          <div className="space-y-3">
            {current?.length > 0 ? (
              current.map((item: any, i: number) => renderItem(item, i))
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed">No existing {title.toLowerCase()}.</p>
            )}
          </div>
        </div>

        {/* Right Side: New */}
        <div className="w-1/2">
          <div className="flex items-center justify-between mb-3 border-b border-blue-200 pb-1">
            <h3 className="text-sm font-bold flex items-center gap-2 text-blue-700">
              {icon} {title}
            </h3>
            {newItems?.length !== undefined && (
              <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 text-[10px] h-5 px-1.5 border-blue-200">
                {newItems.length} found
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            {newItems?.length > 0 ? (
              newItems.map((item: any, i: number) => renderNewItem(item, i))
            ) : (
              <p className="text-xs text-blue-400 italic bg-blue-50/50 p-3 rounded-lg border border-dashed border-blue-100">AI found no {title.toLowerCase()}.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-8 py-5 border-b bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2 text-accent-primary">
            <ArrowRight size={24} className="text-blue-600" />
            <DialogTitle className="text-2xl font-['Lexend_Deca'] text-slate-900">Sync Resume Data</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 mt-1">
            We've carefully extracted your career history from the uploaded file. Compare it with your current profile below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex shrink-0 bg-slate-100 border-b">
            <div className="w-1/2 px-8 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 border-r">
              Your Current Profile
            </div>
            <div className="w-1/2 px-8 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50/50">
              AI Extracted Evidence (New)
            </div>
          </div>

          <ScrollArea className="flex-1 h-full min-h-0 px-8 py-8">
            <div className="max-w-screen-xl mx-auto space-y-10">
              {/* Bio Section */}
              <section>
                <div className="flex gap-6">
                  <div className="w-1/2">
                    {renderSectionHeader(<User size={16} />, "About & Bio")}
                    <div className="p-4 bg-white border rounded-xl shadow-sm space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Title</span>
                        <p className="text-sm font-medium">
                          {Array.isArray(currentData?.about) 
                            ? (currentData.title || "No title set") // In mapped UI, title is at top level
                            : (currentData?.about?.title || "No title set")}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Biography</span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {Array.isArray(currentData?.about)
                            ? (currentData.about[0] || "No biography added yet.")
                            : (currentData?.about?.bio || "No biography added yet.")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2">
                    <div className="flex items-center justify-between mb-3 border-b border-blue-200 pb-1">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-blue-700">
                        <User size={16} /> About & Bio
                      </h3>
                    </div>
                    <div className="p-4 bg-blue-50/30 border border-blue-200 rounded-xl shadow-sm ring-1 ring-blue-50/50 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase">AI Suggested Title</span>
                        <p className="text-sm font-semibold text-blue-900">{newData?.title || "Professional"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase">AI Generated Bio</span>
                        <p className="text-xs text-blue-800 leading-relaxed font-medium italic">"{newData?.bio || "No bio extracted."}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Experience */}
              <Section 
                icon={<Briefcase size={16} />} 
                title="Experience"
                current={currentData?.experiences}
                newItems={newData?.experience}
                renderItem={(exp: any, i: number) => (
                  <div key={i} className="p-4 border rounded-xl bg-white shadow-sm hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm text-slate-800">{exp.jobTitle}</div>
                      <Badge variant="outline" className="text-[9px] py-0 h-4">{exp.type || 'N/A'}</Badge>
                    </div>
                    <div className="text-xs font-semibold text-accent-primary mb-2">{exp.companyName}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{exp.description}</p>
                  </div>
                )}
                renderNewItem={(exp: any, i: number) => (
                  <div key={i} className="p-4 border border-blue-200 rounded-xl bg-white shadow-sm ring-1 ring-blue-50 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm text-blue-900">{exp.jobTitle}</div>
                      <Badge className="bg-blue-600 text-white text-[9px] py-0 h-4 border-none">{exp.type || 'FULL_TIME'}</Badge>
                    </div>
                    <div className="text-xs font-bold text-blue-600 mb-1">{exp.companyName}</div>
                    <div className="text-[10px] text-slate-400 mb-2 font-medium flex items-center gap-1">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </div>
                    <p className="text-[11px] text-blue-800/80 leading-relaxed font-medium bg-blue-50/30 p-2 rounded border border-blue-100/50">{exp.description}</p>
                  </div>
                )}
              />

              {/* Education */}
              <Section 
                icon={<GraduationCap size={16} />} 
                title="Education"
                current={currentData?.educations}
                newItems={newData?.education}
                renderItem={(edu: any, i: number) => (
                  <div key={i} className="p-4 border rounded-xl bg-white shadow-sm">
                    <div className="font-bold text-sm text-slate-800">{edu.school}</div>
                    <div className="text-xs text-slate-500">{edu.degree} in {edu.fieldOfStudy}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{edu.grade && `Grade: ${edu.grade}`}</div>
                  </div>
                )}
                renderNewItem={(edu: any, i: number) => (
                  <div key={i} className="p-4 border border-blue-200 rounded-xl bg-white shadow-sm ring-1 ring-blue-50">
                    <div className="font-bold text-sm text-blue-900">{edu.school}</div>
                    <div className="text-xs font-bold text-blue-600">{edu.degree}</div>
                    <div className="text-xs text-blue-500 font-medium mb-1">{edu.fieldOfStudy}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{edu.startDate} – {edu.endDate || 'Present'}</div>
                    {edu.grade && <div className="text-[10px] text-green-600 font-bold mt-1">GPA: {edu.grade}</div>}
                  </div>
                )}
              />

              {/* Skills */}
              <Section 
                icon={<Code2 size={16} />} 
                title="Skills"
                current={currentData?.skills}
                newItems={newData?.skills}
                renderItem={(s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 px-3 border rounded-lg bg-white shadow-sm">
                    <span className="text-xs font-semibold">{s.title}</span>
                    <Badge variant="secondary" className="text-[9px] h-4">{s.level} • {s.years}y</Badge>
                  </div>
                )}
                renderNewItem={(s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 px-3 border border-blue-200 rounded-lg bg-white shadow-sm ring-1 ring-blue-50">
                    <span className="text-xs font-bold text-blue-900">{s.name}</span>
                    <Badge className="bg-blue-600 text-white text-[9px] h-4 border-none uppercase font-bold">{s.level || 'INTERMEDIATE'} • {s.years || 1}y</Badge>
                  </div>
                )}
              />

              {/* Certificates */}
              <Section 
                icon={<Award size={16} />} 
                title="Certificates"
                current={currentData?.certificates}
                newItems={newData?.certificates}
                renderItem={(c: any, i: number) => (
                  <div key={i} className="p-3 border rounded-lg bg-white shadow-sm">
                    <div className="font-bold text-xs">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.issuer}</div>
                  </div>
                )}
                renderNewItem={(c: any, i: number) => (
                  <div key={i} className="p-3 border border-blue-200 rounded-lg bg-white shadow-sm">
                    <div className="font-bold text-xs text-blue-900">{c.name}</div>
                    <div className="text-[10px] font-bold text-blue-600 mb-1">{c.issuer}</div>
                    <div className="text-[9px] text-slate-400 font-medium italic">{c.issueDate}</div>
                  </div>
                )}
              />

              {/* Contacts & Socials */}
              <div className="flex gap-6 pb-4">
                <div className="w-1/2 space-y-6">
                  <section>
                    {renderSectionHeader(<Phone size={16} />, "Contact Info")}
                    <div className="flex flex-wrap gap-2">
                      {currentData?.contacts?.map((c: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] py-1 border-slate-200 bg-white">
                          <span className="text-slate-400 mr-1">{c.type}:</span> {c.value}
                        </Badge>
                      )) || <p className="text-xs text-slate-400 italic">No contacts.</p>}
                    </div>
                  </section>
                  <section>
                    {renderSectionHeader(<Share2 size={16} />, "Social Links")}
                    <div className="flex flex-wrap gap-2">
                      {currentData?.socials?.map((s: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] py-1 border-slate-200 bg-white">
                          <span className="text-slate-400 mr-1">{s.platform}:</span> {s.url}
                        </Badge>
                      )) || <p className="text-xs text-slate-400 italic">No socials.</p>}
                    </div>
                  </section>
                </div>
                <div className="w-1/2 space-y-6">
                  <section>
                    <div className="flex items-center justify-between mb-3 border-b border-blue-200 pb-1">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-blue-700">
                        <Phone size={16} /> Contact Info
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newData?.contacts?.map((c: any, i: number) => (
                        <Badge key={i} className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[10px] py-1">
                          <span className="text-blue-400 mr-1 uppercase font-bold">{c.type}:</span> {c.value}
                        </Badge>
                      )) || <p className="text-xs text-blue-400 italic">No contacts found.</p>}
                    </div>
                  </section>
                  <section>
                    <div className="flex items-center justify-between mb-3 border-b border-blue-200 pb-1">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-blue-700">
                        <Share2 size={16} /> Social Links
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newData?.socials?.map((s: any, i: number) => (
                        <Badge key={i} className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[10px] py-1">
                          <span className="text-blue-400 mr-1 uppercase font-bold">{s.platform}:</span> {s.url}
                        </Badge>
                      )) || <p className="text-xs text-blue-400 italic">No socials found.</p>}
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Review & Sync Policy</h4>
                  <p className="text-xs text-amber-700 leading-relaxed mt-1">
                    By clicking <strong>"Approve & Sync"</strong>, you agree to add the AI-extracted data on the right to your profile. Existing data will be preserved, and new items will be appended. You can always edit or remove items manually later from your profile dashboard.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-8 py-5 border-t bg-slate-50 shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-[10px] text-slate-400 max-w-[400px]">
              AI extraction can occasionally hallucinate. Please verify dates and titles before syncing.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-slate-500 hover:bg-slate-200 transition-colors">
                Cancel
              </Button>
              <Button onClick={onSync} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> 
                    Syncing profile...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check size={18} strokeWidth={3} /> Approve & Sync Data
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

