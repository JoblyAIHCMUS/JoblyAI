import type { Category } from './data';

// Deterministic color palette for job categories
// Generated using seeded hash (seed: 42) to ensure consistent colors
const COLOR_PALETTE = [
  {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    hoverBg: 'hover:bg-pink-100',
  },
  {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    hoverBg: 'hover:bg-amber-100',
  },
  {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    hoverBg: 'hover:bg-blue-100',
  },
  {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    hoverBg: 'hover:bg-emerald-100',
  },
  {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    hoverBg: 'hover:bg-orange-100',
  },
  {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    hoverBg: 'hover:bg-teal-100',
  },
  {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    hoverBg: 'hover:bg-purple-100',
  },
  {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    hoverBg: 'hover:bg-slate-100',
  },
  {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    hoverBg: 'hover:bg-rose-100',
  },
  {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    hoverBg: 'hover:bg-indigo-100',
  },
  {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    hoverBg: 'hover:bg-cyan-100',
  },
  {
    bg: 'bg-lime-100',
    text: 'text-lime-800',
    hoverBg: 'hover:bg-lime-100',
  },
];

/**
 * Simple hash function that produces a deterministic number from a string and seed.
 * Uses FNV-1a algorithm for consistent hashing.
 */
function hashString(str: string, seed: 42): number {
  let hash = seed ^ 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // FNV prime (32-bit unsigned)
  }
  return hash >>> 0;
}

/**
 * Generates a seeded random number between 0 and 1 from a hash.
 * Uses the hash as seed for deterministic but distributed pseudo-random generation.
 */
function seededRandom(hash: number): number {
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

/**
 * Gets deterministic colors for a job category.
 * Same category always returns the same colors (seeded with 42).
 * Accepts either a JobCategory object or a category name string.
 */
export function getCategoryColors(category: Category | string): {
  bg: string;
  text: string;
  hoverBg: string;
} {
  // Extract the name if a full category object is passed, otherwise use as string
  const categoryName =
    typeof category === 'string' ? category : category?.name || '';
  const hash = hashString(categoryName, 42);
  const randomValue = seededRandom(hash);
  const colorIndex = Math.floor(randomValue * COLOR_PALETTE.length);
  return COLOR_PALETTE[colorIndex];
}

/**
 * Legacy constant interface for backward compatibility.
 * Maps category names (strings) to their deterministic colors.
 */
export const CATEGORY_COLORS = new Proxy(
  {},
  {
    get: (_target, prop: string | symbol) => {
      if (typeof prop === 'string') {
        return getCategoryColors(prop);
      }
      return undefined;
    },
  }
) as Record<string, { bg: string; text: string; hoverBg: string }>;
