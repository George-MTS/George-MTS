import { useState } from 'react';

export default function ApiKeyModal({ onSubmit }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-')) {
      setError('API key must start with "sk-"');
      return;
    }
    sessionStorage.setItem('rl_api_key', trimmed);
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">ResearchLens</h2>
            <p className="text-sm text-slate-400">Enter your Anthropic API key to begin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={e => { setKey(e.target.value); setError(''); }}
              placeholder="sk-ant-..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-sm"
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          <p className="text-xs text-slate-500">
            Your key is stored only in session memory and never sent to any server other than Anthropic's API.
          </p>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            Start Analyzing
          </button>
        </form>
      </div>
    </div>
  );
}
