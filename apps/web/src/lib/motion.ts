// apps/web/src/lib/motion.ts
// Shared motion tokens for the pre-shortlist surfaces.
// Kept tiny and dependency-free. Respect prefers-reduced-motion via Tailwind's
// `motion-reduce:` variants in component-level class names.

export const motion = {
  fast: '150ms ease-out',
  medium: '250ms ease-out',
  slow: '400ms ease-out',
} as const;
