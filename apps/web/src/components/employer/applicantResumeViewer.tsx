import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import React from 'react';
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

  const handleDownload = async () => {
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
      alert('Failed to download resume. Error: ' + err);
    }
  };

  return (
    <div className="h-[80vh] w-full overflow-hidden bg-white">
      <div className="flex justify-end mb-2">
        <Button
          onClick={handleDownload}
          variant="default"
          className="font-medium"
        >
          Download PDF
        </Button>
      </div>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </div>
  );
};

export default ApplicantResumeViewer;
