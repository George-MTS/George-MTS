import { useState, useEffect } from 'react';
import { generateMELens } from '../utils/claudeApi';
import ConfidenceBadge from './ConfidenceBadge';
import SkeletonLoader from './SkeletonLoader';
import ParsedAnalysis from './ParsedAnalysis';

export default function MELensTab({ doc, apiKey }) {
  const [analysis, setAnalysis] = useState(doc.meLensAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (doc.meLensAnalysis) {
      setAnalysis(doc.meLensAnalysis);
      return;
    }
    if (!doc.text || !apiKey) return;

    setLoading(true);
    setError(null);
    generateMELens(apiKey, doc.text, doc.title)
      .then(result => {
        setAnalysis(result);
        doc.meLensAnalysis = result;
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [doc.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        {['Theory of Change', 'Indicators', 'Evidence Gaps', 'M&E Relevance'].map(section => (
          <div key={section}>
            <div className="skeleton h-4 w-32 mb-4 rounded" />
            <SkeletonLoader lines={3} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
        <p className="text-red-400 text-sm font-medium mb-1">Analysis failed</p>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">M&E Lens Analysis</h3>
        <ConfidenceBadge score={analysis.confidence?.score} reason={analysis.confidence?.reason} />
      </div>
      <ParsedAnalysis raw={analysis.raw} />
    </div>
  );
}
