import { useState, useRef, useEffect } from 'react';
import { askThisPaper } from '../utils/claudeApi';
import ConfidenceBadge from './ConfidenceBadge';

export default function AskPaperTab({ doc, apiKey }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState(doc.chatHistory || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function handleAsk(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setQuestion('');
    setLoading(true);
    setError(null);

    try {
      const result = await askThisPaper(apiKey, doc.text, doc.title, q, history);
      const newTurn = { question: q, answer: result.answer, confidence: result.confidence };
      const updated = [...history, newTurn];
      setHistory(updated);
      doc.chatHistory = updated;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-96">
      <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 mb-4 flex gap-2">
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-amber-300">
          Answers are based solely on this document. If the information isn't in the paper, the AI will say so clearly.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {history.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 text-sm">Ask any question about this document</p>
            <p className="text-slate-600 text-xs mt-1">e.g. "What is the sample size?" or "What are the main findings?"</p>
          </div>
        )}

        {history.map((turn, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-teal-600/30 border border-teal-700/50 rounded-xl rounded-tr-sm px-4 py-2.5 max-w-sm">
                <p className="text-sm text-teal-100">{turn.question}</p>
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl rounded-tl-sm p-4 max-w-2xl">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{turn.answer}</p>
              {turn.confidence?.score !== null && (
                <div className="mt-3">
                  <ConfidenceBadge score={turn.confidence?.score} reason={turn.confidence?.reason} />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl rounded-tl-sm p-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-slate-500 text-sm">Searching the document...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleAsk} className="flex gap-2 mt-auto">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask a question about this paper..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
