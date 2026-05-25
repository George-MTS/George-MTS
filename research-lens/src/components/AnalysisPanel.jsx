import { useState } from 'react';
import SummaryTab from './SummaryTab';
import DeepDiveTab from './DeepDiveTab';
import MELensTab from './MELensTab';
import AskPaperTab from './AskPaperTab';

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'deepdive', label: 'Deep Dive' },
  { id: 'melens', label: 'M&E Lens' },
  { id: 'ask', label: 'Ask This Paper' },
];

export default function AnalysisPanel({ doc, apiKey }) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-slate-400 font-medium mb-2">No document selected</h3>
        <p className="text-slate-600 text-sm max-w-xs">Upload a research paper and click on it to start your analysis</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Document header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white leading-snug mb-1 line-clamp-2">
          {doc.title}
        </h2>
        <p className="text-sm text-slate-400 line-clamp-1">{doc.summary}</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 px-6 py-3 border-b border-slate-700/50 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-teal-600/30 text-teal-300 border border-teal-600/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {doc.loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex gap-2 mb-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-slate-400 text-sm">Extracting text from document...</p>
          </div>
        ) : !doc.text ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
            <p className="text-red-400 text-sm">Could not extract text from this document. Please try a different file format.</p>
          </div>
        ) : (
          <>
            {activeTab === 'summary' && <SummaryTab doc={doc} apiKey={apiKey} />}
            {activeTab === 'deepdive' && <DeepDiveTab doc={doc} apiKey={apiKey} />}
            {activeTab === 'melens' && <MELensTab doc={doc} apiKey={apiKey} />}
            {activeTab === 'ask' && <AskPaperTab doc={doc} apiKey={apiKey} />}
          </>
        )}
      </div>
    </div>
  );
}
