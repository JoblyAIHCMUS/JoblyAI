import type { BadgeTone, CompanyTag } from '@/types/recommendedCompany';

const toneMap: Record<BadgeTone, string> = {
  'orange-outline':
    'border border-orange-500 text-orange-500 bg-transparent px-3 py-2',
  'orange-soft': 'bg-orange-100 text-orange-500 px-3 py-1.5',
  'indigo-soft': 'bg-indigo-100 text-indigo-700 px-3 py-1.5',
};

export default function CategoryBadge({ tag }: { tag: CompanyTag }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-sm font-semibold leading-5 tracking-[-0.16px] ${
        toneMap[tag.tone]
      }`}
    >
      {tag.label}
    </span>
  );
}
