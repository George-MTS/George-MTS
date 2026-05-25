export default function ConfidenceBadge({ score, reason, size = 'sm' }) {
  if (score === null || score === undefined) return null;

  const color =
    score >= 75 ? 'bg-emerald-900 text-emerald-300 border-emerald-700' :
    score >= 50 ? 'bg-yellow-900 text-yellow-300 border-yellow-700' :
    'bg-red-900 text-red-300 border-red-700';

  const dot =
    score >= 75 ? 'bg-emerald-400' :
    score >= 50 ? 'bg-yellow-400' :
    'bg-red-400';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium ${color}`} title={reason}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      <span>{score}% confidence</span>
      {reason && (
        <span className="opacity-70 truncate max-w-48" title={reason}>— {reason}</span>
      )}
    </div>
  );
}
