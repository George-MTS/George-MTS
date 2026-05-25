import { useState, useRef } from 'react';

const ACCEPTED = '.pdf,.txt,.docx';

export default function DropZone({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      /\.(pdf|txt|docx)$/i.test(f.name)
    );
    if (files.length) onFiles(files);
  }

  function handleChange(e) {
    const files = Array.from(e.target.files);
    if (files.length) onFiles(files);
    e.target.value = '';
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
        dragging
          ? 'border-teal-400 bg-teal-500/10'
          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
      }`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-2">
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-slate-400">
          Drop files here or <span className="text-teal-400 font-medium">browse</span>
        </p>
        <p className="text-xs text-slate-600">PDF, TXT, DOCX supported</p>
      </div>
    </div>
  );
}
