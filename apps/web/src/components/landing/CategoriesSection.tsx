'use client';
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
  Headset,
  Activity,
  Book,
  Truck,
  ShoppingCart,
  Coffee,
  Shield,
  Home,
  Plane,
  Radio,
  Leaf,
  HardHat,
} from 'lucide-react';
import { usePopularCategories } from '@/api-hook/jobs';
import Link from 'next/link';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  monitor: Monitor,
  code: Code,
  paintbrush: Paintbrush,
  chart: BarChart3,
  megaphone: Megaphone,
  wallet: Wallet,
  briefcase: Briefcase,
  users: Users,
  'head-set': Headset,
  activity: Activity,
  book: Book,
  truck: Truck,
  'shopping-cart': ShoppingCart,
  coffee: Coffee,
  shield: Shield,
  home: Home,
  plane: Plane,
  radio: Radio,
  leaf: Leaf,
  'hard-hat': HardHat,
};

function CategoryCard({
  cat,
}: {
  cat: {
    id: string | number;
    name: string;
    jobCount: number;
    slug: string;
    iconKey?: string | null;
  };
}) {
  const Icon = (cat.iconKey && iconMap[cat.iconKey]) || Briefcase;

  return (
    <Link
      href={`/find-jobs?categoryId=${cat.id}`}
      className="p-6 md:p-8 rounded-lg border transition-all duration-300 block group bg-white border-slate-200 text-slate-900 hover:shadow-lg hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"
    >
      <div className="w-12 h-12 rounded-md mb-8 flex items-center justify-center bg-indigo-100 group-hover:bg-indigo-500 transition-colors duration-300">
        <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-4">{cat.name}</h3>
      <div className="flex items-center gap-3">
        <p className="text-slate-600 group-hover:text-indigo-100 transition-colors duration-300">
          {cat.jobCount} jobs available
        </p>
        <ArrowRight className="w-6 h-6" />
      </div>
    </Link>
  );
}

export default function CategoriesSection() {
  const { categories, loading } = usePopularCategories(8);

  return (
    <section className="py-16 px-4 md:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Explore by <span className="text-indigo-600">category</span>
          </h2>
          <Link
            href="/find-jobs"
            className="text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-700 whitespace-nowrap"
          >
            Show all jobs <ArrowRight className="w-6 h-6" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg bg-slate-100 animate-pulse"
                />
              ))
            : categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
