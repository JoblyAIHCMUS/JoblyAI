type BadgeTone = 'orange-outline' | 'orange-soft' | 'indigo-soft';

interface CompanyTag {
  label: string;
  tone: BadgeTone;
}

interface RecommendedCompany {
  name: string;
  jobs: string;
  description: string;
  logo: {
    symbol: string;
    bgClassName: string;
    textClassName: string;
    rounded?: 'full' | 'square';
  };
  tags: CompanyTag[];
}

const companies: RecommendedCompany[] = [
  {
    name: 'Nomad',
    jobs: '3 Jobs',
    description:
      'Nomad is located in Paris, France. Nomad has generates $728,000 in sales (USD).',
    logo: {
      symbol: 'N',
      bgClassName: 'bg-emerald-300',
      textClassName: 'text-white',
      rounded: 'square',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Discord',
    jobs: '3 Jobs',
    description:
      "We'd love to work with someone like you. We care about creating a delightful experience.",
    logo: {
      symbol: 'D',
      bgClassName: 'bg-indigo-500',
      textClassName: 'text-white',
      rounded: 'full',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Maze',
    jobs: '3 Jobs',
    description:
      "We're a passionate bunch working from all over the world to build the future of rapid testing together.",
    logo: {
      symbol: 'M',
      bgClassName: 'bg-blue-600',
      textClassName: 'text-white',
      rounded: 'full',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Udacity',
    jobs: '3 Jobs',
    description:
      'Udacity is a new type of online university that teaches the actual programming skills.',
    logo: {
      symbol: 'U',
      bgClassName: 'bg-cyan-500',
      textClassName: 'text-white',
      rounded: 'full',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Webflow',
    jobs: '3 Jobs',
    description:
      'Webflow is the first design and hosting platform built from the ground up for the mobile age.',
    logo: {
      symbol: 'W',
      bgClassName: 'bg-indigo-600',
      textClassName: 'text-white',
      rounded: 'square',
    },
    tags: [
      { label: 'Business Service', tone: 'orange-outline' },
      { label: 'Technology', tone: 'orange-soft' },
    ],
  },
  {
    name: 'Foundation',
    jobs: '3 Jobs',
    description:
      'Foundation helps creators mint and auction their digital artworks as NFTs on the Ethereum blockchain.',
    logo: {
      symbol: 'F',
      bgClassName: 'bg-black',
      textClassName: 'text-white',
      rounded: 'square',
    },
    tags: [
      { label: 'Business Service', tone: 'orange-outline' },
      { label: 'Crypto', tone: 'indigo-soft' },
    ],
  },
];

function CategoryBadge({ tag }: { tag: CompanyTag }) {
  const toneMap: Record<BadgeTone, string> = {
    'orange-outline':
      'border border-orange-500 text-orange-500 bg-transparent px-3 py-2',
    'orange-soft': 'bg-orange-100 text-orange-500 px-3 py-1.5',
    'indigo-soft': 'bg-indigo-100 text-indigo-700 px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-sm font-semibold leading-5 tracking-[-0.16px] ${toneMap[tag.tone]}`}
    >
      {tag.label}
    </span>
  );
}

function CompanyLogo({ company }: { company: RecommendedCompany }) {
  const roundedClassName = company.logo.rounded === 'square' ? 'rounded-none' : 'rounded-full';

  return (
    <div
      className={`h-20 w-20 ${roundedClassName} ${company.logo.bgClassName} inline-flex items-center justify-center`}
      aria-hidden="true"
    >
      <span className={`text-4xl font-semibold tracking-tight ${company.logo.textClassName}`}>
        {company.logo.symbol}
      </span>
    </div>
  );
}

function CompanyCard({ company }: { company: RecommendedCompany }) {
  return (
    <article className="rounded-[10px] border border-slate-300 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <CompanyLogo company={company} />
        <span className="inline-flex rounded-sm bg-indigo-50 px-3 py-1 text-base font-normal leading-[22px] tracking-[-0.18px] text-indigo-700">
          {company.jobs}
        </span>
      </div>

      <h3 className="mb-4 text-3xl font-semibold leading-[30px] tracking-[-0.15px] text-slate-900">
        {company.name}
      </h3>

      <p className="mb-4 min-h-[96px] text-base leading-6 text-slate-600">
        {company.description}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {company.tags.map((tag) => (
          <CategoryBadge key={`${company.name}-${tag.label}`} tag={tag} />
        ))}
      </div>
    </article>
  );
}

export default function RecommendedCompaniesSection() {
  return (
    <section className="bg-white px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold leading-[38px] tracking-[-0.2px] text-slate-900 md:text-[32px]">
            Recommended Companies
          </h2>
          <p className="mt-2 text-base leading-[1.6] text-slate-600">
            Based on your profile, company preferences, and recent activity
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.name} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
