import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface JobCompanySectionProps {
  companyName: string;
  logoUrl: string;
  description: string;
  photos: string[];
  companyUrl?: string;
}

export default function JobCompanySection({
  companyName,
  logoUrl,
  description,
  photos,
  companyUrl = '#',
}: JobCompanySectionProps) {
  const mainPhoto = photos[0];
  const galleryPhotos = photos.slice(1, 4);

  return (
    <section className="bg-white py-[72px]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Left: Company info */}
          <div className="flex flex-col gap-8 lg:max-w-[600px]">
            {/* Company header */}
            <div className="flex items-start gap-3">
              {/* Logo */}
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-white">
                <Image
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>

              {/* Name + link */}
              <div className="flex flex-col">
                <span className="text-[28px] sm:text-[32px] font-semibold text-slate-900 leading-tight">
                  {companyName}
                </span>
                <Link
                  href={companyUrl}
                  className="flex items-center gap-1 text-indigo-600 font-semibold text-base hover:text-indigo-700 transition-colors"
                >
                  Read more about {companyName}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Description */}
            <p className="text-base leading-6 text-slate-500">{description}</p>
          </div>

          {/* Right: Office photos */}
          {mainPhoto ? (
            <div className="flex flex-col gap-3 w-full lg:w-auto lg:max-w-[490px]">
              {/* Large photo */}
              <div className="relative w-full lg:w-[316px] h-[210px] rounded overflow-hidden">
                <Image
                  src={mainPhoto}
                  alt={`${companyName} office`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* Grid of smaller photos */}
              {galleryPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryPhotos.map((photo, index) => (
                    <div key={`${photo}-${index}`} className="relative h-[130px] rounded overflow-hidden">
                      <Image
                        src={photo}
                        alt={`${companyName} office ${index + 2}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
