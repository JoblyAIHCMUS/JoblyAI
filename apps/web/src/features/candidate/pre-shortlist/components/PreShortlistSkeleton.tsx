// apps/web/src/features/candidate/pre-shortlist/components/PreShortlistSkeleton.tsx

export function PreShortlistSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto px-3 sm:px-0">
      <div className="h-8 w-1/2 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-24 w-full bg-slate-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
