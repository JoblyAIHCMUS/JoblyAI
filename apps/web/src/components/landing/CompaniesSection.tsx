import Image from 'next/image';

const companies = [
  { name: 'Vodafone', logo: 'landing/vodafone-logo.svg', width: 154, height: 40 },
  { name: 'Intel', logo: 'landing/intel-logo.svg', width: 82, height: 32 },
  { name: 'Tesla', logo: 'landing/tesla-logo.svg', width: 183, height: 24 },
  { name: 'AMD', logo: 'landing/amd-logo.svg', width: 116, height: 28 },
  { name: 'TalkIt', logo: 'landing/talkit-logo.svg', width: 108, height: 32 },
];

export default function CompaniesSection() {
  return (
    <section className="py-12 px-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-medium text-slate-900 mb-8">Companies we helped grow</h2>
        <div className="flex justify-between items-center gap-8">
          {companies.map((company) => (
            <div
              key={company.name}
              className="relative flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              style={{ width: company.width, height: company.height }}
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={company.width}
                height={company.height}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}