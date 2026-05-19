'use client';

import React, { useEffect, useState } from 'react';
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
import {
  Trash2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Share2,
  Phone,
  User,
  FileX,
  Mail,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { previewDeleteImpact } from '@/api-client/ai';

interface CvDeleteImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keepData?: boolean) => Promise<void>;
  isLoading?: boolean;
  resumeName: string;
  resumeId: number;
  currentData: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  certificates?: any[];
  contacts?: any[];
  socials?: any[];
}

export function CvDeleteImpactModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  resumeName,
  resumeId,
  currentData,
  experiences = [],
  educations = [],
  skills = [],
  certificates = [],
  contacts = [],
  socials = [],
}: CvDeleteImpactModalProps) {
  const [previewBio, setPreviewBio] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [isPreviewBioLoading, setIsPreviewBioLoading] = useState(false);

  // A CV is the "last one" if the resumes array has exactly 1 item
  const isLastCv = currentData?.resumes?.length === 1;

  useEffect(() => {
    // Only fetch preview if NOT the last CV (if it's the last, the new bio will just be empty)
    if (isOpen && resumeId && !isLastCv) {
      const fetchPreview = async () => {
        setIsPreviewBioLoading(true);
        try {
          const result = await previewDeleteImpact(resumeId);
          setPreviewBio(result.previewBio);
          setPreviewTitle(result.previewTitle);
        } catch (error) {
          console.error('Failed to fetch bio preview:', error);
          setPreviewBio(null);
          setPreviewTitle(null);
        } finally {
          setIsPreviewBioLoading(false);
        }
      };
      fetchPreview();
    } else {
      setPreviewBio(null);
      setPreviewTitle(null);
      setIsPreviewBioLoading(false);
    }
  }, [isOpen, resumeId, isLastCv]);

  const getAffectedItems = () => {
    const filterFn = (item: any) => {
      const sourceIds = Array.isArray(item.sourceCvIds)
        ? item.sourceCvIds.map(String)
        : [];
      return sourceIds.length === 1 && sourceIds.includes(String(resumeId));
    };

    const affectedSkills = (skills || []).filter(filterFn);
    const affectedExperiences = (experiences || []).filter(filterFn);
    const affectedEducations = (educations || []).filter(filterFn);
    const affectedCertificates = (certificates || []).filter(filterFn);
    const affectedContacts = (contacts || []).filter(filterFn);
    const affectedSocials = (socials || []).filter(filterFn);

    return {
      skills: affectedSkills,
      experiences: affectedExperiences,
      educations: affectedEducations,
      certificates: affectedCertificates,
      contacts: affectedContacts,
      socials: affectedSocials,
      totalAffected:
        affectedSkills.length +
        affectedExperiences.length +
        affectedEducations.length +
        affectedCertificates.length +
        affectedContacts.length +
        affectedSocials.length,
    };
  };

  const affected = getAffectedItems();

  const renderSectionHeader = (
    icon: React.ReactNode,
    title: string,
    colorClass: string
  ) => (
    <div
      className={cn(
        'flex items-center justify-between mb-3 border-b pb-1',
        colorClass
      )}
    >
      <h3 className="text-sm font-bold flex items-center gap-2 font-['Lexend_Deca']">
        {icon} {title}
      </h3>
    </div>
  );

  const Section = ({
    icon,
    title,
    current,
    affectedItems,
    renderItem,
    colorClass,
  }: any) => (
    <section className="mb-8 last:mb-0">
      <div className="flex gap-6">
        {/* Left Side: Current State */}
        <div className="w-1/2">
          {renderSectionHeader(icon, title, 'text-slate-700 border-slate-200')}
          <div className="space-y-3 opacity-60">
            {current?.length > 0 ? (
              current.map((item: any, i: number) => renderItem(item, i, false))
            ) : (
              <p className="text-[10px] text-slate-400 italic">
                No items found.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Affected Items */}
        <div className="w-1/2">
          {renderSectionHeader(
            icon,
            `${title} to be removed`,
            'text-red-700 border-red-200'
          )}
          <div className="space-y-3">
            {affectedItems?.length > 0 ? (
              affectedItems.map((item: any, i: number) =>
                renderItem(item, i, true)
              )
            ) : (
              <p className="text-[10px] text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed">
                No unique items from this CV.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-10 py-6 border-b bg-red-50/40 shrink-0">
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileX size={28} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-['Lexend_Deca'] text-slate-900 leading-none">
                Delete CV: {resumeName}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-2 text-sm">
                Carefully review the changes below. Deleting this document will
                remove all profile data that was{' '}
                <span className="font-bold text-red-600">exclusively</span>{' '}
                extracted from it.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex shrink-0 bg-slate-100/80 border-b backdrop-blur-sm">
            <div className="w-1/2 px-10 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-r flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" /> Current
              Profile Status
            </div>
            <div className="w-1/2 px-10 py-3 text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />{' '}
              Deletion Impact (Unique Data)
            </div>
          </div>

          <ScrollArea className="flex-1 h-full min-h-0 px-10 py-8 bg-white">
            <div className="max-w-4xl mx-auto space-y-12">
              {/* About Me & Bio Preview */}
              <section>
                <div className="flex gap-6">
                  <div className="w-1/2">
                    {renderSectionHeader(
                      <User size={16} />,
                      'Current Profile',
                      'text-slate-700 border-slate-200'
                    )}
                    <div className="p-4 bg-slate-50 border rounded-xl shadow-sm opacity-60 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Current Title
                        </span>
                        <p className="text-sm font-medium">
                          {Array.isArray(currentData?.about)
                            ? currentData.title || 'No title set'
                            : currentData?.about?.title || 'No title set'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Current Bio
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                          "
                          {Array.isArray(currentData?.about)
                            ? currentData.about[0] || 'No biography provided.'
                            : currentData?.about?.bio ||
                              'No biography provided.'}
                          "
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2">
                    {renderSectionHeader(
                      <ArrowRight size={16} />,
                      isLastCv ? 'Final Outcome' : 'New AI-Generated Profile',
                      isLastCv
                        ? 'text-red-700 border-red-200'
                        : 'text-blue-700 border-blue-200'
                    )}
                    <div
                      className={cn(
                        'p-4 border rounded-xl shadow-sm ring-1 relative min-h-[100px] space-y-3',
                        isLastCv
                          ? 'bg-red-50/30 border-red-200 ring-red-50/50'
                          : 'bg-blue-50/30 border-blue-200 ring-blue-50/50'
                      )}
                    >
                      {isPreviewBioLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl z-10">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mb-2" />
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                            AI is thinking...
                          </span>
                        </div>
                      ) : previewBio || previewTitle ? (
                        <div className="animate-in fade-in slide-in-from-bottom-1 duration-500 space-y-3">
                          <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100 text-[9px] border-blue-200 uppercase tracking-tighter font-bold">
                            AI Preview
                          </Badge>
                          {previewTitle && (
                            <div>
                              <span className="text-[10px] font-bold text-blue-400 uppercase">
                                New Suggested Title
                              </span>
                              <p className="text-sm font-semibold text-blue-900">
                                {previewTitle}
                              </p>
                            </div>
                          )}
                          {previewBio && (
                            <div>
                              <span className="text-[10px] font-bold text-blue-400 uppercase">
                                New Generated Bio
                              </span>
                              <p className="text-xs text-blue-800 leading-relaxed font-medium italic">
                                "{previewBio}"
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <AlertTriangle
                            size={20}
                            className={cn(
                              'mb-2',
                              isLastCv ? 'text-red-500' : 'text-slate-400'
                            )}
                          />
                          <p
                            className={cn(
                              'text-[11px] italic font-bold',
                              isLastCv ? 'text-red-700' : 'text-slate-500'
                            )}
                          >
                            {isLastCv
                              ? 'THIS IS YOUR LAST CV. Deleting it will clear your entire profile as there is no remaining evidence.'
                              : 'No remaining source data to generate a new profile. This field will be cleared.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Experience */}
              <Section
                icon={<Briefcase size={16} />}
                title="Work Experience"
                current={experiences}
                affectedItems={affected.experiences}
                renderItem={(exp: any, i: number, isAffected: boolean) => (
                  <div
                    key={i}
                    className={cn(
                      'p-4 border rounded-xl bg-white shadow-sm transition-all',
                      isAffected
                        ? 'border-red-200 ring-1 ring-red-50/50 scale-[1.02] shadow-red-100/50'
                        : 'border-slate-200'
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div
                        className={cn(
                          'font-bold text-sm tracking-tight',
                          isAffected ? 'text-red-900' : 'text-slate-800'
                        )}
                      >
                        {exp.jobTitle}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'text-xs font-semibold',
                        isAffected ? 'text-red-600' : 'text-blue-600'
                      )}
                    >
                      {exp.companyName}
                    </div>
                    {isAffected && (
                      <Badge className="mt-2 bg-red-100 text-red-700 hover:bg-red-100 text-[9px] border-red-200 uppercase tracking-tighter font-bold">
                        Will be removed
                      </Badge>
                    )}
                  </div>
                )}
              />

              {/* Education */}
              <Section
                icon={<GraduationCap size={16} />}
                title="Education History"
                current={educations}
                affectedItems={affected.educations}
                renderItem={(edu: any, i: number, isAffected: boolean) => (
                  <div
                    key={i}
                    className={cn(
                      'p-4 border rounded-xl bg-white shadow-sm transition-all',
                      isAffected
                        ? 'border-red-200 ring-1 ring-red-50/50 scale-[1.02] shadow-red-100/50'
                        : 'border-slate-200'
                    )}
                  >
                    <div
                      className={cn(
                        'font-bold text-sm tracking-tight',
                        isAffected ? 'text-red-900' : 'text-slate-800'
                      )}
                    >
                      {edu.school}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {edu.degree} • {edu.fieldOfStudy}
                    </div>
                    {edu.grade && (
                      <div className="text-[10px] text-slate-400 mt-1 italic">
                        Grade: {edu.grade}
                      </div>
                    )}
                    {isAffected && (
                      <Badge className="mt-2 bg-red-100 text-red-700 hover:bg-red-100 text-[9px] border-red-200 uppercase tracking-tighter font-bold">
                        Will be removed
                      </Badge>
                    )}
                  </div>
                )}
              />

              {/* Skills */}
              <Section
                icon={<Code2 size={16} />}
                title="Professional Skills"
                current={skills}
                affectedItems={affected.skills}
                renderItem={(s: any, i: number, isAffected: boolean) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm transition-all',
                      isAffected
                        ? 'border-red-200 ring-1 ring-red-50/50 scale-[1.02]'
                        : 'border-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-bold tracking-tight',
                        isAffected ? 'text-red-900' : 'text-slate-800'
                      )}
                    >
                      {s.title}
                    </span>
                    {isAffected ? (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[9px] border-red-200 font-bold uppercase tracking-tighter">
                        Remove
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[9px] h-5 bg-slate-100 text-slate-600 font-bold uppercase tracking-tighter"
                      >
                        {s.level}
                      </Badge>
                    )}
                  </div>
                )}
              />

              {/* Certificates */}
              <Section
                icon={<Award size={16} />}
                title="Certifications & Licenses"
                current={certificates}
                affectedItems={affected.certificates}
                renderItem={(cert: any, i: number, isAffected: boolean) => (
                  <div
                    key={i}
                    className={cn(
                      'p-4 border rounded-xl bg-white shadow-sm transition-all',
                      isAffected
                        ? 'border-red-200 ring-1 ring-red-50/50 scale-[1.02] shadow-red-100/50'
                        : 'border-slate-200'
                    )}
                  >
                    <div
                      className={cn(
                        'font-bold text-sm tracking-tight',
                        isAffected ? 'text-red-900' : 'text-slate-800'
                      )}
                    >
                      {cert.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {cert.issuer}
                    </div>
                    {cert.credentialId && (
                      <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">
                        ID: {cert.credentialId}
                      </div>
                    )}
                    {isAffected && (
                      <Badge className="mt-2 bg-red-100 text-red-700 hover:bg-red-100 text-[9px] border-red-200 uppercase tracking-tighter font-bold">
                        Will be removed
                      </Badge>
                    )}
                  </div>
                )}
              />

              {/* Contacts & Socials */}
              <div className="flex gap-6 mb-8">
                <div className="w-1/2">
                  {renderSectionHeader(
                    <Mail size={16} />,
                    'Contacts',
                    'text-slate-700 border-slate-200'
                  )}
                  <div className="space-y-2">
                    {(contacts || []).length > 0 ? (
                      (contacts || []).map((c: any, i: number) => {
                        const isAff =
                          Array.isArray(c.sourceCvIds) &&
                          c.sourceCvIds.length === 1 &&
                          c.sourceCvIds.includes(resumeId);
                        return (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm',
                              isAff
                                ? 'border-red-200 opacity-100 ring-1 ring-red-50'
                                : 'border-slate-200 opacity-60'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {c.type === 'EMAIL' ? (
                                <Mail size={12} className="text-slate-400" />
                              ) : (
                                <Phone size={12} className="text-slate-400" />
                              )}
                              <span
                                className={cn(
                                  'text-[11px] font-bold',
                                  isAff ? 'text-red-900' : 'text-slate-700'
                                )}
                              >
                                {c.value}
                              </span>
                            </div>
                            {isAff && (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[9px] border-red-200 font-bold uppercase tracking-tighter">
                                Remove
                              </Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">
                        No contacts found.
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-1/2">
                  {renderSectionHeader(
                    <Globe size={16} />,
                    'Social Links',
                    'text-slate-700 border-slate-200'
                  )}
                  <div className="space-y-2">
                    {(socials || []).length > 0 ? (
                      (socials || []).map((s: any, i: number) => {
                        const isAff =
                          Array.isArray(s.sourceCvIds) &&
                          s.sourceCvIds.length === 1 &&
                          s.sourceCvIds.includes(resumeId);
                        return (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm',
                              isAff
                                ? 'border-red-200 opacity-100 ring-1 ring-red-50'
                                : 'border-slate-200 opacity-60'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Share2 size={12} className="text-slate-400" />
                              <span
                                className={cn(
                                  'text-[11px] font-bold truncate max-w-[150px]',
                                  isAff ? 'text-red-900' : 'text-slate-700'
                                )}
                              >
                                {s.url}
                              </span>
                            </div>
                            {isAff && (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[9px] border-red-200 font-bold uppercase tracking-tighter">
                                Remove
                              </Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">
                        No social links found.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-900 font-['Lexend_Deca']">
                    Critical Action Required
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed mt-1 font-medium">
                    This action is irreversible. Deleting this CV will
                    permanently purge the {affected.totalAffected} data points
                    highlighted above. Your professional profile and AI score
                    will be automatically recalculated to reflect the remaining
                    data sources.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-10 py-6 border-t bg-slate-50/50 shrink-0 backdrop-blur-sm">
          <div className="flex items-center justify-between w-full">
            <p className="text-[11px] text-slate-400 font-medium">
              Powered by JoblyAI Source Tracking Engine
            </p>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="text-slate-500 hover:bg-slate-200 px-6 font-bold transition-all"
              >
                Cancel
              </Button>

              <Button
                variant="outline"
                onClick={() => onConfirm(true)}
                disabled={isLoading || isPreviewBioLoading}
                className="border-slate-300 text-slate-700 px-6 font-bold transition-all active:scale-95 h-11"
              >
                {isLoading ? 'Processing...' : 'Keep Profile Data'}
              </Button>

              <Button
                onClick={() => onConfirm(false)}
                disabled={isLoading || isPreviewBioLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-10 font-bold shadow-xl shadow-red-200 transition-all active:scale-95 border-none h-11 disabled:bg-slate-300 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    AI is cleaning up...
                  </span>
                ) : isPreviewBioLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Preparing Preview...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 size={20} />{' '}
                    {isLastCv ? 'Confirm Total Reset' : 'Confirm & Purge Data'}
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
