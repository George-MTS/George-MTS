import { useState, useEffect } from 'react';
import { generateSummaryTab } from '../utils/claudeApi';
import ConfidenceBadge from './ConfidenceBadge';
import SkeletonLoader from './SkeletonLoader';
import ParsedAnalysis from './ParsedAnalysis';

export default function SummaryTab({ doc, apiKey }) {
  const [analysis, setAnalysis] = useState(doc.summaryAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (doc.summaryAnalysis) {
      setAnalysis(doc.summaryAnalysis);
      return;
    }
    if (!doc.text || !apiKey) return;

    setLoading(true);
    setError(null);
    generateSummaryTab(apiKey, doc.text, doc.title)
      .then(result => {
        setAnalysis(result);
        doc.summaryAnalysis = result;
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [doc.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton h-4 w-32 mb-4 rounded" />
          <SkeletonLoader lines={7} />
        </div>
        <div>
          <div className="skeleton h-4 w-28 mb-4 rounded" />
          <SkeletonLoader lines={4} />
        </div>
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
        <h3 className="text-sm font-semibold text-slate-200">Executive Summary</h3>
        <ConfidenceBadge score={analysis.confidence?.score} reason={analysis.confidence?.reason} />
      </div>
      <ParsedAnalysis raw={analysis.raw} />
    </div>
  );
}
