import type { Category } from './data';

export const CATEGORY_COLORS: Record<
  Category,
  { bg: string; text: string; hoverBg: string }
> = {
  design: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    hoverBg: 'hover:bg-pink-100',
  },
  marketing: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    hoverBg: 'hover:bg-amber-100',
  },
  business: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    hoverBg: 'hover:bg-blue-100',
  },
  technology: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    hoverBg: 'hover:bg-emerald-100',
  },
  sales: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    hoverBg: 'hover:bg-orange-100',
  },
  finance: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    hoverBg: 'hover:bg-teal-100',
  },
  'human-resources': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    hoverBg: 'hover:bg-purple-100',
  },
  operations: {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    hoverBg: 'hover:bg-slate-100',
  },
  other: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    hoverBg: 'hover:bg-gray-100',
  },
};
