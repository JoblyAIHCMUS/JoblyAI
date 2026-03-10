import type { RecommendedCompany } from '@/types/recommendedCompany';

export default function CompanyLogo({ company }: { company: RecommendedCompany }) {
  const roundedClassName = company.logo.rounded === 'square' ? 'rounded-none' : 'rounded-full';

  return (
    <div
      className={`inline-flex h-20 w-20 items-center justify-center overflow-hidden bg-white ${roundedClassName}`}
    >
      <img
        src={company.logo.imageUrl}
        alt={company.logo.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
