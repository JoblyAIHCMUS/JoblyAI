'use client';

import { useState } from 'react';
import { Facebook, Globe, Linkedin, MapPin, Twitter } from 'lucide-react';
import { RichTextContent } from '@/components/ui/rich-text-content';
import type {
  CompanyProfile,
  CompanyContactLink,
} from '@/types/companyProfile';
import { RichTextContent } from '@/components/ui/rich-text-content';

function ContactIcon({ type }: { type: CompanyContactLink['type'] }) {
  const iconClassName = 'h-4 w-4';

  switch (type) {
    case 'twitter':
      return <Twitter className={iconClassName} />;
    case 'facebook':
      return <Facebook className={iconClassName} />;
    case 'linkedin':
      return <Linkedin className={iconClassName} />;
    default:
      return <Globe className={iconClassName} />;
  }
}

export default function CompanyOverviewSection({
  company,
}: {
  company: CompanyProfile;
}) {
  const [mainImage, ...galleryImages] = company.gallery;
  const [showAllLocations, setShowAllLocations] = useState(false);
  const maxVisibleLocations = 4;
  const hasMoreLocations = company.officeLocations.length > maxVisibleLocations;
  const visibleLocations = showAllLocations
    ? company.officeLocations
    : company.officeLocations.slice(0, maxVisibleLocations);

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-[72px]">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,752px)_minmax(280px,1fr)] lg:gap-[60px] lg:px-8">
        <div className="space-y-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
                Company Profile
              </h2>
              <RichTextContent
                html={company.description ?? ''}
                className="text-base leading-7 text-slate-600 [&_p]:my-0 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-3 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
                Contact
              </h3>
              <div className="flex flex-wrap gap-3">
                {company.contacts.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 rounded-[5px] border border-indigo-300 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
                  >
                    <ContactIcon type={contact.type} />
                    {contact.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.45fr)_minmax(0,0.8fr)]">
            {mainImage ? (
              <div className="overflow-hidden rounded-[2px]">
                <img
                  src={mainImage}
                  alt={`${company.name} office main view`}
                  className="h-full min-h-[300px] w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="grid gap-3">
              {galleryImages.slice(0, 3).map((image, index) => (
                <div key={image} className="overflow-hidden rounded-[2px]">
                  <img
                    src={image}
                    alt={`${company.name} office ${index + 2}`}
                    className="h-[160px] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:pt-1">
          <div className="space-y-4">
            <h2 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
              Office Location
            </h2>
            <p className="text-base leading-7 text-slate-600">
              {company.officeSummary}
            </p>
          </div>

          <div className="space-y-4 border-b border-slate-200 pb-6">
            {visibleLocations.map((location) => (
              <div key={location} className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-base font-medium text-slate-900">
                  {location}
                </span>
              </div>
            ))}

            {hasMoreLocations ? (
              <button
                type="button"
                onClick={() => setShowAllLocations((prev) => !prev)}
                className="text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-800"
              >
                {showAllLocations ? 'See fewer locations' : 'See all locations'}
              </button>
            ) : null}
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Global Presence
                </p>
                <p className="text-base leading-7 text-slate-600">
                  Teams are distributed across product, design, operations, and
                  go-to-market hubs with a hybrid collaboration model.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
