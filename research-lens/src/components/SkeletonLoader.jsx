export default function SkeletonLoader({ lines = 6 }) {
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-full', 'w-3/4', 'w-5/6', 'w-2/3'];
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-700 rounded ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-4 animate-pulse space-y-3">
      <div className="h-4 bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-700 rounded w-1/2" />
      <div className="h-3 bg-slate-700 rounded w-full" />
      <div className="h-3 bg-slate-700 rounded w-5/6" />
    </div>
  );
}
