import type { CompanyCardData } from '@/types/company';

export default function CompanyLogo({ company }: { company: CompanyCardData }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white">
      {company.logoUrl ? (
        <img
          src={company.logoUrl}
          alt={company.logoAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-2xl font-bold text-slate-900">
          {company.name.charAt(0)}
        </span>
      )}
    </div>
  );
}
