import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import React from 'react';

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
  return (
    <div
      style={{
        height: '80vh',
        width: '100%',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </div>
  );
};

export default ApplicantResumeViewer;
