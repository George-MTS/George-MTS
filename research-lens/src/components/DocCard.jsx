const DOC_TYPE_COLORS = {
  'RCT': 'bg-purple-900/60 text-purple-300 border-purple-700',
  'Survey': 'bg-blue-900/60 text-blue-300 border-blue-700',
  'Policy Brief': 'bg-amber-900/60 text-amber-300 border-amber-700',
  'Case Study': 'bg-orange-900/60 text-orange-300 border-orange-700',
  'Mixed Methods': 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  'Unknown': 'bg-slate-700/60 text-slate-400 border-slate-600',
};

export default function DocCard({ doc, isActive, onClick, onRemove }) {
  const typeColor = DOC_TYPE_COLORS[doc.docType] || DOC_TYPE_COLORS['Unknown'];

  return (
    <div
      className={`rounded-xl border cursor-pointer transition-all group relative ${
        isActive
          ? 'border-teal-500 bg-slate-700/80'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeColor}`}>
            {doc.docType || 'Unknown'}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0 -mt-0.5"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            title="Remove document"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 className="text-sm font-medium text-white leading-snug mb-1 line-clamp-2">
          {doc.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {doc.loading ? (
            <span className="flex gap-1">
              <span className="skeleton h-3 w-full rounded" />
            </span>
          ) : (
            doc.summary || 'Processing...'
          )}
        </p>

        <p className="text-xs text-slate-600">
          {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {doc.loading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
          <div className="h-full bg-teal-500 animate-pulse" />
        </div>
      )}
    </div>
  );
}
