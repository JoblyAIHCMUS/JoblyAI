import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Download, Sparkles } from 'lucide-react';
import type { CandidateProfileUI } from '../types';
import { ProfilePdfTemplate } from './ProfilePdfTemplate';

interface OverleafCvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfileUI;
  aboutText?: string;
  pdfRef: React.RefObject<HTMLDivElement | null>;
  onExportPdf: () => Promise<void> | void;
  isExportingPdf: boolean;
}

export function OverleafCvExportModal({
  isOpen,
  onClose,
  candidate,
  aboutText,
  pdfRef,
  onExportPdf,
  isExportingPdf,
}: OverleafCvExportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-xl shadow-2xl border border-slate-200">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              CV Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Your profile is automatically formatted into standard A4.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* PDF PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 m-0">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white shadow-xl rounded border border-slate-300 overflow-hidden max-w-full">
              <ProfilePdfTemplate ref={pdfRef} candidate={candidate} aboutText={aboutText} />
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex flex-row items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>

          <button
            onClick={async () => {
              await onExportPdf();
            }}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
