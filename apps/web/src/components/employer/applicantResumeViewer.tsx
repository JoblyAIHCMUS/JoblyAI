'use client';

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
    <div className="h-[70vh] w-full overflow-hidden bg-white">
      {/* PDF rendering using HTML embed */}
      <div className="w-full h-full flex justify-center items-center">
        <embed
          src={pdfUrl}
          type="application/pdf"
          className="w-full h-[70vh] border rounded"
        />
      </div>
    </div>
  );
};

export default ApplicantResumeViewer;
