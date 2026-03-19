import type { CompanyCardData } from '@/types/company';

export default function CompanyLogo({ company }: { company: CompanyCardData }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white">
      <img
        src={company.logoUrl}
        alt={company.logoAlt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
