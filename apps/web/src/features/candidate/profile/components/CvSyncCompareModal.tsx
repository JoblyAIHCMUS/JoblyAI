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
import { Check, ArrowRight, Briefcase, GraduationCap, Code2, Award, Share2, Phone, User, Info, Plus, Edit2, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/date-picker';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CvSyncCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: any;
  newData: any;
  onSync: (draftData: any) => Promise<void>;
  onExtract?: () => void;
  isLoading?: boolean;
  isSynced?: boolean;
}

// Define types for clarity
type SyncStatus = 'EXISTING' | 'MATCHED' | 'NEW';

function DatePickerField({ value, onChange, placeholder }: { value: string; onChange: (date: Date | null) => void; placeholder?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dateValue = value ? new Date(value) : undefined;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative w-full">
        <Input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
          placeholder={placeholder}
          className="bg-white text-slate-900 border-slate-200 text-sm pr-10 w-full h-9"
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer z-10"
            onClick={() => setIsOpen(true)}
          >
            <CalendarIcon size={16} />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0 z-[100]" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => {
            onChange(date || null);
            setIsOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function EditItemDialog({ isOpen, onClose, section, data, onSave }: any) {
  const [formData, setFormData] = React.useState<any>(null);

  React.useEffect(() => {
    if (data) setFormData({ ...data });
  }, [data, isOpen]);

  if (!formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev: any) => ({ ...prev, [name]: date ? date.toISOString() : '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Edit {section}</DialogTitle>
          <DialogDescription>Make changes to the extracted data below.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
          {section === 'bio' && (
            <>
              <div className="grid gap-2">
                <Label>Professional Title</Label>
                <Input name="title" value={formData.title || ''} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Biography</Label>
                <Textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={6} />
              </div>
            </>
          )}

          {section === 'experience' && (
            <>
              <div className="grid gap-2">
                <Label>Job Title</Label>
                <Input name="jobTitle" value={formData.jobTitle || ''} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Company Name</Label>
                <Input name="companyName" value={formData.companyName || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <DatePickerField value={formData.startDate} onChange={(date) => handleDateChange('startDate', date)} />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <DatePickerField value={formData.endDate} onChange={(date) => handleDateChange('endDate', date)} placeholder="Present" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} />
              </div>
            </>
          )}

          {section === 'education' && (
            <>
              <div className="grid gap-2">
                <Label>School / University</Label>
                <Input name="school" value={formData.school || ''} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Degree</Label>
                <Input name="degree" value={formData.degree || ''} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Field of Study</Label>
                <Input name="fieldOfStudy" value={formData.fieldOfStudy || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <DatePickerField value={formData.startDate} onChange={(date) => handleDateChange('startDate', date)} />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <DatePickerField value={formData.endDate} onChange={(date) => handleDateChange('endDate', date)} />
                </div>
              </div>
            </>
          )}

          {section === 'skills' && (
            <>
              <div className="grid gap-2">
                <Label>Skill Name</Label>
                <Input name="name" value={formData.name || formData.title || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Level</Label>
                  <Input name="level" value={formData.level || 'INTERMEDIATE'} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label>Years</Label>
                  <Input name="years" type="number" value={formData.years || 1} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          {section === 'certificates' && (
            <>
              <div className="grid gap-2">
                <Label>Certificate Name</Label>
                <Input name="name" value={formData.name || ''} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Issuer</Label>
                <Input name="issuer" value={formData.issuer || ''} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Issue Date</Label>
                <DatePickerField value={formData.issueDate} onChange={(date) => handleDateChange('issueDate', date)} />
              </div>
            </>
          )}

          {(section === 'contacts' || section === 'socials') && (
            <>
              <div className="grid gap-2">
                <Label>{section === 'contacts' ? 'Type' : 'Platform'}</Label>
                <Input name={section === 'contacts' ? 'type' : 'platform'} value={formData[section === 'contacts' ? 'type' : 'platform'] || ''} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>{section === 'contacts' ? 'Value' : 'URL'}</Label>
                <Input name={section === 'contacts' ? 'value' : 'url'} value={formData[section === 'contacts' ? 'value' : 'url'] || ''} onChange={handleChange} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onSave(formData)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CvSyncCompareModal({
  isOpen,
  onClose,
  currentData,
  newData,
  onSync,
  onExtract,
  isLoading = false,
  isSynced = false,
}: CvSyncCompareModalProps) {
  const [draftData, setDraftData] = React.useState<any>(null);
  const [editingItem, setEditingItem] = React.useState<{ section: string; index: number; data: any } | null>(null);
  const hasInitialized = React.useRef(false);

  const normalize = (str: string) => str ? str.trim().toLowerCase() : '';

  const counts = React.useMemo(() => {
    if (!draftData) return { newCount: 0, matchCount: 0 };
    
    let newCount = 0;
    let matchCount = 0;
    
    // Bio & Title is always considered an AI Merged/New item in this view
    newCount += 1;

    const sections = ['experience', 'education', 'skills', 'certificates', 'contacts', 'socials'];
    sections.forEach(section => {
      if (Array.isArray(draftData[section])) {
        draftData[section].forEach((item: any) => {
          if (item.isDuplicate) matchCount++;
          else newCount++;
        });
      }
    });
    
    return { newCount, matchCount };
  }, [draftData]);

  const Legend = () => (
    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-slate-300 rounded-full" />
        <span className="text-xs font-medium text-slate-500">Existing (Profile)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
        <span className="text-xs font-medium text-amber-700">Matched (Update)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
        <span className="text-xs font-medium text-indigo-700">New / AI Merged</span>
      </div>
    </div>
  );

  React.useEffect(() => {
    if (isOpen && newData && !hasInitialized.current) {
      // Use newData directly as it already contains isDuplicate flags from Backend Vector Search
      setDraftData(JSON.parse(JSON.stringify(newData)));
      hasInitialized.current = true;
    }
    
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, newData]);

  const handleUpdateDraft = (section: string, index: number, data: any) => {
    setDraftData((prev: any) => {
      const next = { ...prev };
      if (section === 'bio') {
        next.title = data.title;
        next.bio = data.bio;
      } else if (Array.isArray(next[section])) {
        next[section][index] = data;
      }
      return next;
    });
    setEditingItem(null);
  };

  const handleDeleteDraft = (section: string, index: number) => {
    setDraftData((prev: any) => {
      const next = { ...prev };
      if (Array.isArray(next[section])) {
        next[section] = next[section].filter((_: any, i: number) => i !== index);
      }
      return next;
    });
  };

  const handleAddDraft = (section: string, defaultValue: any) => {
    setDraftData((prev: any) => {
      const next = { ...prev };
      if (!Array.isArray(next[section])) {
        next[section] = [];
      }
      next[section] = [...next[section], defaultValue];
      return next;
    });
    // Open editor for the newly added item
    setTimeout(() => {
      setEditingItem({ section, index: draftData[section]?.length || 0, data: defaultValue });
    }, 0);
  };

  const formatDisplayDate = (date: string | null | undefined) => {
    if (!date) return 'Present';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date; // Fallback to raw string if invalid
      return d.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return date;
    }
  };

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

  const MergedSection = ({ icon, title, current, draft, renderItem, onEdit, onDelete, onAdd }: any) => {
    const preservedExisting = current?.filter((oldItem: any) => {
      return !draft?.some((newItem: any) => {
        if (!newItem.isDuplicate || !newItem.matchedId) return false;
        return title === "Skills" ? newItem.matchedId === oldItem.skillId : newItem.matchedId === oldItem.id;
      });
    }).map((item: any) => ({ ...item, _syncStatus: 'EXISTING' as SyncStatus }));

    const draftItems = draft?.map((item: any, index: number) => ({
      ...item,
      _syncStatus: (item.isDuplicate ? 'MATCHED' : 'NEW') as SyncStatus,
      _draftIndex: index
    }));

    const allItems = [...(preservedExisting || []), ...(draftItems || [])];

    return (
      <section className="mb-8 last:mb-0">
        <div className="flex gap-6">
          {/* Left Side: Reference (Current) */}
          <div className="w-1/2">
            {renderSectionHeader(icon, title, current?.length)}
            <div className="space-y-3">
              {current?.length > 0 ? (
                current.map((item: any, i: number) => (
                  <div key={i} className="opacity-50 grayscale-[0.2] pointer-events-none">
                    {renderItem(item, i)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed text-center">No existing {title.toLowerCase()}.</p>
              )}
            </div>
          </div>

          {/* Right Side: Merged Preview (Result of Sync) */}
          <div className="w-1/2">
            <div className="flex items-center justify-between mb-3 border-b border-indigo-200 pb-1">
              <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-700">
                {icon} {title} (Resulting Profile)
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-[9px] gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-0"
                onClick={onAdd}
              >
                <Plus size={10} /> Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                {allItems.map((item: any, i: number) => {
                  const status = item._syncStatus;
                  const isDraft = status !== 'EXISTING';
                  const draftIndex = item._draftIndex;

                  return (
                    <div key={i} className="relative group">
                      <div className={cn(
                        "absolute -left-2 top-0 bottom-0 w-1 rounded-full shadow-sm",
                        status === 'EXISTING' && "bg-slate-300 opacity-50",
                        status === 'MATCHED' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
                        status === 'NEW' && "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                      )} />
                      
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          {renderItem(item, i, status)}
                        </div>
                        
                        {isDraft && (
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-indigo-600 hover:bg-indigo-50" onClick={() => onEdit(draftIndex)}>
                              <Edit2 size={12} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => onDelete(draftIndex)}>
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        )}
                      </div>

                      {status === 'EXISTING' && (
                        <Badge variant="outline" className="absolute -right-1 -top-2 bg-white text-slate-400 text-[8px] h-4 border-slate-200 shadow-sm uppercase font-bold">Existing</Badge>
                      )}
                      {status === 'MATCHED' && (
                        <Badge className="absolute -right-1 -top-2 bg-amber-500 text-white text-[8px] h-4 border-none shadow-sm uppercase font-bold">Matched</Badge>
                      )}
                      {status === 'NEW' && (
                        <Badge className="absolute -right-1 -top-2 bg-indigo-500 text-white text-[8px] h-4 border-none shadow-sm uppercase font-bold">New</Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {allItems.length === 0 && (
                <p className="text-xs text-indigo-400 italic bg-indigo-50/30 p-3 rounded-lg border border-dashed border-indigo-100 text-center">
                  No {title.toLowerCase()} to display.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };


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
              {/* Summary and Legend */}
              <div className="mb-10">
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Summary Changes</h2>
                  <span className="text-sm text-slate-500">
                    Found <span className="font-bold text-indigo-600">{counts.newCount}</span> new items and <span className="font-bold text-amber-600">{counts.matchCount}</span> matched items.
                  </span>
                </div>
                <Legend />
              </div>

              {/* Bio & Title Section */}
              <section className="mb-8">
                <div className="flex gap-6">
                  <div className="w-1/2">
                    {renderSectionHeader(<User size={16} />, "About & Bio")}
                    <div className="p-4 bg-white border rounded-xl shadow-sm space-y-3 opacity-50 pointer-events-none">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Title</span>
                        <p className="text-sm font-medium">
                          {Array.isArray(currentData?.about) 
                            ? (currentData.title || "No title set")
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
                        <User size={16} /> Merged About & Bio Preview
                      </h3>
                    </div>
                    <div className="relative group">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 p-4 bg-indigo-50/30 border border-indigo-200 rounded-xl shadow-sm ring-1 ring-indigo-50/50 space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">AI Suggested Title</span>
                            <p className="text-sm font-semibold text-indigo-900">{draftData?.title || "Professional"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">AI Generated Bio</span>
                            <p className="text-xs text-indigo-800 leading-relaxed font-medium italic">"{draftData?.bio || "No bio extracted."}"</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-indigo-600 hover:bg-indigo-50" 
                            onClick={() => setEditingItem({ section: 'bio', index: 0, data: { title: draftData?.title, bio: draftData?.bio } })}>
                            <Edit2 size={12} />
                          </Button>
                        </div>
                      </div>
                      <Badge className="absolute -right-1 -top-2 bg-indigo-500 text-white text-[8px] h-4 border-none shadow-sm uppercase font-bold">AI Merged</Badge>
                    </div>
                  </div>
                </div>
              </section>

              {/* Experience */}
              <MergedSection 
                icon={<Briefcase size={16} />} 
                title="Experience"
                current={currentData?.experiences}
                draft={draftData?.experience}
                onAdd={() => handleAddDraft('experience', { jobTitle: 'New Job', companyName: 'Company', type: 'FULL_TIME', startDate: '2024', endDate: '', description: '' })}
                onEdit={(i: number) => setEditingItem({ section: 'experience', index: i, data: draftData.experience[i] })}
                onDelete={(i: number) => handleDeleteDraft('experience', i)}
                renderItem={(exp: any, i: number, status?: SyncStatus) => (
                  <div className={cn(
                    "p-4 border rounded-xl bg-white shadow-sm transition-colors",
                    status === 'EXISTING' && "opacity-60 grayscale-[0.5] border-slate-200",
                    status === 'MATCHED' && "border-amber-200 ring-1 ring-amber-50 hover:border-amber-300",
                    status === 'NEW' && "border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-300",
                    !status && "hover:border-slate-300"
                  )}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={cn(
                        "font-bold text-sm",
                        status === 'MATCHED' ? "text-amber-900" : status === 'NEW' ? "text-indigo-900" : "text-slate-800"
                      )}>{exp.jobTitle}</div>
                      <Badge variant={status === 'NEW' ? "default" : "outline"} className={cn(
                        "text-[9px] py-0 h-4",
                        status === 'NEW' && "bg-indigo-600 text-white border-none",
                        status === 'MATCHED' && "border-amber-200 text-amber-700"
                      )}>{exp.type || 'N/A'}</Badge>
                    </div>
                    <div className={cn(
                      "text-xs font-semibold mb-1",
                      status === 'MATCHED' ? "text-amber-600" : status === 'NEW' ? "text-indigo-600" : "text-accent-primary"
                    )}>{exp.companyName}</div>
                    <div className="text-[10px] text-slate-400 mb-2 font-medium flex items-center gap-1">
                      {formatDisplayDate(exp.startDate)} – {formatDisplayDate(exp.endDate)}
                    </div>
                    <p className={cn(
                      "text-[11px] leading-relaxed",
                      status === 'MATCHED' || status === 'NEW' 
                        ? cn("font-medium p-2 rounded border", 
                            status === 'MATCHED' ? "text-amber-800/80 bg-amber-50/30 border-amber-100/50" : "text-indigo-800/80 bg-indigo-50/30 border-indigo-100/50")
                        : "text-slate-500 line-clamp-2"
                    )}>{exp.description}</p>
                  </div>
                )}
              />

              {/* Education */}
              <MergedSection 
                icon={<GraduationCap size={16} />} 
                title="Education"
                current={currentData?.educations}
                draft={draftData?.education}
                onAdd={() => handleAddDraft('education', { school: 'University', degree: 'Degree', fieldOfStudy: 'Major', startDate: '2020', endDate: '2024', grade: '' })}
                onEdit={(i: number) => setEditingItem({ section: 'education', index: i, data: draftData.education[i] })}
                onDelete={(i: number) => handleDeleteDraft('education', i)}
                renderItem={(edu: any, i: number, status?: SyncStatus) => (
                  <div className={cn(
                    "p-4 border rounded-xl bg-white shadow-sm transition-colors",
                    status === 'EXISTING' && "opacity-60 grayscale-[0.5] border-slate-200",
                    status === 'MATCHED' && "border-amber-200 ring-1 ring-amber-50 hover:border-amber-300",
                    status === 'NEW' && "border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-300",
                    !status && "hover:border-slate-300"
                  )}>
                    <div className={cn(
                      "font-bold text-sm",
                      status === 'MATCHED' ? "text-amber-900" : status === 'NEW' ? "text-indigo-900" : "text-slate-800"
                    )}>{edu.school}</div>
                    <div className={cn(
                      "text-xs",
                      status === 'MATCHED' ? "text-amber-600 font-bold" : status === 'NEW' ? "text-indigo-600 font-bold" : "text-slate-500"
                    )}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">{formatDisplayDate(edu.startDate)} – {formatDisplayDate(edu.endDate)}</div>
                    {edu.grade && <div className={cn(
                      "text-[10px] font-bold mt-1",
                      status === 'MATCHED' || status === 'NEW' ? "text-green-600" : "text-slate-400"
                    )}>GPA: {edu.grade}</div>}
                  </div>
                )}
              />

              {/* Skills */}
              <MergedSection 
                icon={<Code2 size={16} />} 
                title="Skills"
                current={currentData?.skills}
                draft={draftData?.skills}
                onAdd={() => handleAddDraft('skills', { name: 'New Skill', level: 'INTERMEDIATE', years: 1 })}
                onEdit={(i: number) => setEditingItem({ section: 'skills', index: i, data: draftData.skills[i] })}
                onDelete={(i: number) => handleDeleteDraft('skills', i)}
                renderItem={(s: any, i: number, status?: SyncStatus) => (
                  <div className={cn(
                    "flex items-center justify-between p-2 px-3 border rounded-lg bg-white shadow-sm transition-colors",
                    status === 'EXISTING' && "opacity-60 grayscale-[0.5] border-slate-200",
                    status === 'MATCHED' && "border-amber-200 ring-1 ring-amber-50 hover:border-amber-300",
                    status === 'NEW' && "border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-300",
                    !status && "hover:border-slate-300"
                  )}>
                    <span className={cn(
                      "text-xs font-semibold",
                      status === 'MATCHED' ? "text-amber-900 font-bold" : status === 'NEW' ? "text-indigo-900 font-bold" : "text-slate-700"
                    )}>{status === 'EXISTING' || !status ? s.title : s.name}</span>
                    <Badge variant={status === 'NEW' ? "default" : "secondary"} className={cn(
                      "text-[9px] h-4",
                      status === 'NEW' && "bg-indigo-600 text-white border-none uppercase font-bold",
                      status === 'MATCHED' && "bg-amber-100 text-amber-700 border-amber-200 uppercase font-bold"
                    )}>{s.level} • {s.years}y</Badge>
                  </div>
                )}
              />

              {/* Certificates */}
              <MergedSection 
                icon={<Award size={16} />} 
                title="Certificates"
                current={currentData?.certificates}
                draft={draftData?.certificates}
                onAdd={() => handleAddDraft('certificates', { name: 'Certificate', issuer: 'Organization', issueDate: '2024' })}
                onEdit={(i: number) => setEditingItem({ section: 'certificates', index: i, data: draftData.certificates[i] })}
                onDelete={(i: number) => handleDeleteDraft('certificates', i)}
                renderItem={(c: any, i: number, status?: SyncStatus) => (
                  <div className={cn(
                    "p-3 border rounded-lg bg-white shadow-sm transition-colors",
                    status === 'EXISTING' && "opacity-60 grayscale-[0.5] border-slate-200",
                    status === 'MATCHED' && "border-amber-200 ring-1 ring-amber-50 hover:border-amber-300",
                    status === 'NEW' && "border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-300",
                    !status && "hover:border-slate-300"
                  )}>
                    <div className={cn(
                      "font-bold text-xs",
                      status === 'MATCHED' ? "text-amber-900" : status === 'NEW' ? "text-indigo-900" : "text-slate-800"
                    )}>{c.name}</div>
                    <div className={cn(
                      "text-[10px]",
                      status === 'MATCHED' ? "text-amber-600 font-bold" : status === 'NEW' ? "text-indigo-600 font-bold" : "text-slate-500"
                    )}>{c.issuer}</div>
                    {c.issueDate && <div className="text-[9px] text-slate-400 font-medium italic mt-1">{formatDisplayDate(c.issueDate)}</div>}
                  </div>
                )}
              />

              {/* Contacts */}
              <MergedSection 
                icon={<Phone size={16} />} 
                title="Contact Info"
                current={currentData?.contacts}
                draft={draftData?.contacts}
                onAdd={() => handleAddDraft('contacts', { type: 'PHONE', value: '' })}
                onEdit={(i: number) => setEditingItem({ section: 'contacts', index: i, data: draftData.contacts[i] })}
                onDelete={(i: number) => handleDeleteDraft('contacts', i)}
                renderItem={(c: any, i: number, status?: SyncStatus) => (
                  <div className={cn(
                    "p-2 px-3 border rounded-lg bg-white shadow-sm transition-colors",
                    status === 'EXISTING' && "opacity-60 grayscale-[0.5] border-slate-200",
                    status === 'MATCHED' && "border-amber-200 ring-1 ring-amber-50 hover:border-amber-300",
                    status === 'NEW' && "border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-300",
                    !status && "hover:border-slate-300"
                  )}>
                    <span className={cn(
                      "text-xs font-semibold",
                      status === 'MATCHED' ? "text-amber-900 font-bold" : status === 'NEW' ? "text-indigo-900 font-bold" : "text-slate-700"
                    )}>{c.type}: {c.value}</span>
                  </div>
                )}
              />

              {/* Socials */}
              <MergedSection 
                icon={<Share2 size={16} />} 
                title="Social Links"
                current={currentData?.socials}
                draft={draftData?.socials}
                onAdd={() => handleAddDraft('socials', { platform: 'LINKEDIN', url: '' })}
                onEdit={(i: number) => setEditingItem({ section: 'socials', index: i, data: draftData.socials[i] })}
                onDelete={(i: number) => handleDeleteDraft('socials', i)}
                renderItem={(s: any, i: number, status?: SyncStatus) => (
                  <div className={cn(
                    "p-2 px-3 border rounded-lg bg-white shadow-sm transition-colors",
                    status === 'EXISTING' && "opacity-60 grayscale-[0.5] border-slate-200",
                    status === 'MATCHED' && "border-amber-200 ring-1 ring-amber-50 hover:border-amber-300",
                    status === 'NEW' && "border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-300",
                    !status && "hover:border-slate-300"
                  )}>
                    <span className={cn(
                      "text-xs font-semibold",
                      status === 'MATCHED' ? "text-amber-900 font-bold" : status === 'NEW' ? "text-indigo-900 font-bold" : "text-slate-700"
                    )}>{s.platform}: {s.url}</span>
                  </div>
                )}
              />

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

              {onExtract && !isSynced && (
                <Button 
                  variant="outline" 
                  onClick={onExtract} 
                  disabled={isLoading}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Code2 size={16} className="mr-2" /> Extract Again
                </Button>
              )}

              {isSynced ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => onSync(draftData)} 
                    disabled={isLoading} 
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 font-bold"
                  >
                    Update Profile
                  </Button>
                  <Button 
                    onClick={onExtract} 
                    disabled={isLoading} 
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 font-bold shadow-lg shadow-amber-200 transition-all active:scale-95"
                  >
                    <Code2 size={18} className="mr-2" strokeWidth={3} /> Extract Again
                  </Button>
                </>
              ) : (
                <Button onClick={() => onSync(draftData)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
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
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
      {editingItem && (
        <EditItemDialog 
          isOpen={!!editingItem} 
          onClose={() => setEditingItem(null)} 
          section={editingItem.section} 
          data={editingItem.data} 
          onSave={(updatedData: any) => handleUpdateDraft(editingItem.section, editingItem.index, updatedData)} 
        />
      )}
    </Dialog>
  );
}

