import {
  ArrowRight,
  Paintbrush,
  BarChart3,
  Megaphone,
  Wallet,
  Monitor,
  Code,
  Briefcase,
  Users,
} from 'lucide-react';

interface Category {
  name: string;
  jobs: number;
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: Category[] = [
  { name: 'Design', jobs: 235, icon: Paintbrush },
  { name: 'Sales', jobs: 756, icon: BarChart3 },
  { name: 'Marketing', jobs: 140, active: true, icon: Megaphone },
  { name: 'Finance', jobs: 325, icon: Wallet },
  { name: 'Technology', jobs: 436, icon: Monitor },
  { name: 'Engineering', jobs: 542, icon: Code },
  { name: 'Business', jobs: 211, icon: Briefcase },
  { name: 'Human Resource', jobs: 346, icon: Users },
];

function CategoryCard({ cat }: { cat: Category }) {
  return (
    <div
      className={`p-6 md:p-8 rounded-lg border transition ${
        cat.active
          ? 'bg-indigo-600 border-indigo-600 text-white'
          : 'bg-white border-slate-200 text-slate-900 hover:shadow-lg'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-md mb-8 flex items-center justify-center ${
          cat.active ? 'bg-indigo-500' : 'bg-indigo-100'
        }`}
      >
        <cat.icon
          className={`w-6 h-6 ${cat.active ? 'text-white' : 'text-indigo-600'}`}
        />
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-4">{cat.name}</h3>
      <div className="flex items-center gap-3">
        <p className={cat.active ? 'text-indigo-100' : 'text-slate-600'}>
          {cat.jobs} jobs available
        </p>
        <ArrowRight className="w-6 h-6" />
      </div>
    </div>
  );
}

export default function CategoriesSection() {
  return (
    <section className="py-16 px-4 md:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Explore by <span className="text-indigo-600">category</span>
          </h2>
          <button className="text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-700 whitespace-nowrap">
            Show all jobs <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
