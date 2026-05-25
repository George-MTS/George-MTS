import ConfidenceBadge from './ConfidenceBadge';

const DOC_TYPE_COLORS = {
  'RCT': 'text-purple-300',
  'Survey': 'text-blue-300',
  'Policy Brief': 'text-amber-300',
  'Case Study': 'text-orange-300',
  'Mixed Methods': 'text-emerald-300',
  'Unknown': 'text-slate-400',
};

function FieldRow({ label, docs, field }) {
  return (
    <tr className="border-t border-slate-700/50">
      <td className="py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap w-32">
        {label}
      </td>
      {docs.map(doc => (
        <td key={doc.id} className="py-3 px-4 text-sm text-slate-300 align-top">
          {field(doc)}
        </td>
      ))}
    </tr>
  );
}

export default function CompareView({ docs, selectedIds, onSelectionChange }) {
  const selected = docs.filter(d => selectedIds.includes(d.id));

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-1">Compare Documents</h2>
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 mt-3">
          <p className="text-xs text-amber-300 leading-relaxed">
            <strong>Disclaimer:</strong> Documents may have different purposes, methodologies, and scopes. This comparison is for reference only. No automatic conclusions are drawn across documents.
          </p>
        </div>
      </div>

      {/* Document selector */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-medium">Select documents to compare (up to 4)</p>
        <div className="flex flex-wrap gap-2">
          {docs.map(doc => (
            <button
              key={doc.id}
              onClick={() => {
                if (selectedIds.includes(doc.id)) {
                  onSelectionChange(selectedIds.filter(id => id !== doc.id));
                } else if (selectedIds.length < 4) {
                  onSelectionChange([...selectedIds, doc.id]);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedIds.includes(doc.id)
                  ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              {doc.title.length > 30 ? doc.title.slice(0, 30) + '…' : doc.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {selected.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-slate-500 text-sm">Select at least 2 documents above to compare</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wide w-32">Field</th>
                  {selected.map(doc => (
                    <th key={doc.id} className="py-3 px-4 text-left min-w-48">
                      <span className="text-sm font-medium text-white line-clamp-2">{doc.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <FieldRow
                  label="Type"
                  docs={selected}
                  field={doc => (
                    <span className={`font-medium ${DOC_TYPE_COLORS[doc.docType] || 'text-slate-400'}`}>
                      {doc.docType || 'Unknown'}
                    </span>
                  )}
                />
                <FieldRow
                  label="One-line summary"
                  docs={selected}
                  field={doc => doc.summary || '—'}
                />
                <FieldRow
                  label="Uploaded"
                  docs={selected}
                  field={doc => new Date(doc.uploadedAt).toLocaleDateString()}
                />
                <FieldRow
                  label="Summary confidence"
                  docs={selected}
                  field={doc => doc.summaryAnalysis?.confidence ? (
                    <ConfidenceBadge
                      score={doc.summaryAnalysis.confidence.score}
                      reason={doc.summaryAnalysis.confidence.reason}
                    />
                  ) : <span className="text-slate-600 text-xs">Not yet analyzed</span>}
                />
                <FieldRow
                  label="M&E relevance"
                  docs={selected}
                  field={doc => {
                    if (!doc.meLensAnalysis) return <span className="text-slate-600 text-xs">Not yet analyzed</span>;
                    const raw = doc.meLensAnalysis.raw || '';
                    const relevanceMatch = raw.match(/ME_RELEVANCE[\s\S]*?Rating:\s*(High|Medium|Low)/i);
                    const rating = relevanceMatch ? relevanceMatch[1] : null;
                    if (!rating) return <span className="text-slate-500 text-xs">See M&E Lens tab</span>;
                    const colors = { High: 'text-emerald-400', Medium: 'text-yellow-400', Low: 'text-red-400' };
                    return <span className={`font-medium ${colors[rating] || 'text-slate-400'}`}>{rating}</span>;
                  }}
                />
                <FieldRow
                  label="Deep dive confidence"
                  docs={selected}
                  field={doc => doc.deepDiveAnalysis?.confidence ? (
                    <ConfidenceBadge
                      score={doc.deepDiveAnalysis.confidence.score}
                      reason={doc.deepDiveAnalysis.confidence.reason}
                    />
                  ) : <span className="text-slate-600 text-xs">Not yet analyzed</span>}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
