'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { RichTextContent } from '@/components/ui/rich-text-content';

export interface CompanyInfo {
  id: number;
  name: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
}

interface JobCompanySectionProps {
  company: CompanyInfo;
  description: string;
  photos: string[];
  companyUrl?: string;
}

export default function JobCompanySection({
  company,
  description,
  photos,
  companyUrl = '#',
}: JobCompanySectionProps) {
  const [logoError, setLogoError] = useState(false);
  const [mainPhotoError, setMainPhotoError] = useState(false);
  const [galleryPhotoErrors, setGalleryPhotoErrors] = useState<Set<string>>(
    new Set()
  );

  const mainPhoto = photos[0];
  const galleryPhotos = photos.slice(1, 4);

  const handleGalleryPhotoError = (url: string) => {
    setGalleryPhotoErrors((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  return (
    <section className="bg-white py-[72px]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Left: Company info */}
          <div className="flex flex-col gap-8 lg:max-w-[600px]">
            {/* Company header */}
            <div className="flex items-start gap-3">
              {/* Logo */}
              <Link
                href={companyUrl}
                className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-white hover:opacity-90 transition-opacity"
              >
                {company.logoUrl && !logoError ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                    unoptimized
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-2xl font-bold leading-none text-indigo-700">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Name + link */}
              <div className="flex flex-col">
                <span className="text-[28px] sm:text-[32px] font-semibold text-slate-900 leading-tight">
                  {company.name}
                </span>
                <Link
                  href={companyUrl}
                  className="flex items-center gap-1 text-indigo-600 font-semibold text-base hover:text-indigo-700 transition-colors"
                >
                  Read more about {company.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Description */}
            <RichTextContent html={description} />
          </div>

          {/* Right: Office photos */}
          {mainPhoto && !mainPhotoError ? (
            <div className="flex flex-col gap-3 w-full lg:w-auto lg:max-w-[490px]">
              {/* Large photo */}
              <div className="relative w-full lg:w-[316px] h-[210px] rounded overflow-hidden">
                <Image
                  src={mainPhoto}
                  alt={`${company.name} office`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 316px"
                  className="object-cover"
                  unoptimized
                  onError={() => setMainPhotoError(true)}
                />
              </div>
              {/* Grid of smaller photos */}
              {galleryPhotos.some(
                (photo) => !galleryPhotoErrors.has(photo)
              ) && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryPhotos.map(
                    (photo, index) =>
                      !galleryPhotoErrors.has(photo) && (
                        <div
                          key={`${photo}-${index}`}
                          className="relative h-[130px] rounded overflow-hidden"
                        >
                          <Image
                            src={photo}
                            alt={`${company.name} office ${index + 2}`}
                            fill
                            sizes="(max-width: 1024px) 33vw, 100px"
                            className="object-cover"
                            unoptimized
                            onError={() => handleGalleryPhotoError(photo)}
                          />
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
