'use client';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ApplicantResumeViewerProps {
  url: string;
}

// For local dev, convert relative path to absolute URL if needed
function getPdfUrl(url: string) {
  if (url.startsWith('http')) return url;
  // Next.js public folder: /public/ is root, otherwise use as-is
  if (typeof window !== 'undefined') {
    // Try to resolve as public asset
    if (url.startsWith('/')) return url;
    return `/${url}`;
  }
  return url;
}

const ApplicantResumeViewer: React.FC<ApplicantResumeViewerProps> = ({
  url,
}) => {
  const pdfUrl = getPdfUrl(url);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    // Clear any previous error
    setError(null);
    // For external URLs, just open/download
    if (pdfUrl.startsWith('http')) {
      window.open(pdfUrl, '_blank');
      return;
    }
    // For public assets, fetch and download
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = url.split('/').pop() || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError('Failed to download resume. Please try again.');
    }
  };

  return (
    <div className="h-[80vh] w-full overflow-hidden bg-white">
      <div className="flex justify-end mb-2">
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handleDownload}
            variant="default"
            className="font-medium"
          >
            Download PDF
          </Button>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </div>
  );
};

export default ApplicantResumeViewer;
