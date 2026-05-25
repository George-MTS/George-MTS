import { useState, useCallback } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import DropZone from './components/DropZone';
import DocCard from './components/DocCard';
import AnalysisPanel from './components/AnalysisPanel';
import CompareView from './components/CompareView';
import { extractTextFromFile, truncateForAPI } from './utils/pdfExtractor';
import { generateQuickSummary } from './utils/claudeApi';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function deriveTitleFromText(text, filename) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  const candidate = lines.find(l => l.length > 10 && l.length < 120);
  if (candidate) return candidate;
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('rl_api_key') || null);
  const [docs, setDocs] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [view, setView] = useState('analyze');
  const [compareSelected, setCompareSelected] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeDoc = docs.find(d => d.id === activeDocId) || null;

  const handleFiles = useCallback(async (files) => {
    for (const file of files) {
      const id = generateId();
      const placeholder = {
        id,
        title: file.name.replace(/\.[^.]+$/, ''),
        filename: file.name,
        summary: '',
        docType: 'Unknown',
        text: null,
        loading: true,
        uploadedAt: Date.now(),
        summaryAnalysis: null,
        deepDiveAnalysis: null,
        meLensAnalysis: null,
        chatHistory: [],
      };

      setDocs(prev => [...prev, placeholder]);
      setActiveDocId(id);
      setView('analyze');

      try {
        const rawText = await extractTextFromFile(file);
        const title = deriveTitleFromText(rawText, file.name);
        const text = truncateForAPI(rawText);

        setDocs(prev => prev.map(d =>
          d.id === id ? { ...d, text, title, loading: false } : d
        ));

        if (apiKey && text) {
          generateQuickSummary(apiKey, text, title)
            .then(({ summary, docType }) => {
              setDocs(prev => prev.map(d =>
                d.id === id ? { ...d, summary, docType } : d
              ));
            })
            .catch(() => {
              setDocs(prev => prev.map(d =>
                d.id === id ? { ...d, summary: 'Summary unavailable', docType: 'Unknown' } : d
              ));
            });
        }
      } catch {
        setDocs(prev => prev.map(d =>
          d.id === id ? { ...d, loading: false, summary: 'Could not extract text' } : d
        ));
      }
    }
  }, [apiKey]);

  const removeDoc = useCallback((id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setCompareSelected(prev => prev.filter(cid => cid !== id));
    if (activeDocId === id) setActiveDocId(null);
  }, [activeDocId]);

  if (!apiKey) {
    return <ApiKeyModal onSubmit={setApiKey} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-slate-800/80 border-r border-slate-700/60 transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white">ResearchLens</h1>
            <p className="text-xs text-slate-500 truncate">M&E Analysis Tool</p>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-slate-700/60">
          <DropZone onFiles={handleFiles} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {docs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600 text-xs">No documents yet — upload one above</p>
            </div>
          )}
          {docs.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              isActive={activeDocId === doc.id && view === 'analyze'}
              onClick={() => { setActiveDocId(doc.id); setView('analyze'); }}
              onRemove={() => removeDoc(doc.id)}
            />
          ))}
        </div>

        {docs.length >= 2 && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-700/60">
            <button
              onClick={() => {
                setView(v => v === 'compare' ? 'analyze' : 'compare');
                if (compareSelected.length === 0) {
                  setCompareSelected(docs.slice(0, 2).map(d => d.id));
                }
              }}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                view === 'compare'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {view === 'compare' ? 'Back to Analysis' : 'Compare Documents'}
            </button>
          </div>
        )}

        <div className="px-4 pb-4">
          <button
            onClick={() => { sessionStorage.removeItem('rl_api_key'); setApiKey(null); }}
            className="w-full py-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Reset API key
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-700/60 bg-slate-800/40 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            {view === 'compare' ? (
              <span className="text-sm font-medium text-slate-300">Document Comparison</span>
            ) : activeDoc ? (
              <span className="text-sm text-slate-400 truncate">{activeDoc.filename}</span>
            ) : (
              <span className="text-sm text-slate-600">Select a document to analyze</span>
            )}
          </div>
          <span className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded">
            {docs.length} {docs.length === 1 ? 'doc' : 'docs'}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {view === 'compare' ? (
            <CompareView
              docs={docs}
              selectedIds={compareSelected}
              onSelectionChange={setCompareSelected}
            />
          ) : (
            <AnalysisPanel doc={activeDoc} apiKey={apiKey} />
          )}
        </div>
      </main>
    </div>
  );
}
