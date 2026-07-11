'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24, className: 'w-6 h-6' },
  md: { width: 32, height: 32, className: 'w-8 h-8' },
  lg: { width: 48, height: 48, className: 'w-12 h-12' },
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeConfig = sizeMap[size];
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`flex-shrink-0 rounded-full overflow-hidden ${sizeConfig.className} ${className}`}
    >
      {hasError ? (
        <div className="w-full h-full bg-indigo-600" aria-label="JoblyAI Logo" role="img" />
      ) : (
        <Image
          src="https://storage.googleapis.com/joblyai-public/assets/public/jobly-logo-v1.svg"
          alt="JoblyAI Logo"
          width={sizeConfig.width}
          height={sizeConfig.height}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
