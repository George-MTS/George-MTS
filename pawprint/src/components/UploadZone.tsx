'use client';

import { useRef, useState } from 'react';

interface UploadZoneProps {
  file: File | null;
  preview: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export default function UploadZone({ file, preview, onFileSelect, onClear }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      onFileSelect(dropped);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  };

  if (preview && file) {
    return (
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#666',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Pet Photo
        </label>
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #2a2a2a',
            aspectRatio: '16/9',
            background: '#161616',
          }}
        >
          <img
            src={preview}
            alt="Pet preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                background: 'rgba(13, 13, 13, 0.85)',
                border: '1px solid #2a2a2a',
                color: '#e8c97e',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
                fontSize: '12px',
              }}
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={onClear}
              style={{
                background: 'rgba(13, 13, 13, 0.85)',
                border: '1px solid #2a2a2a',
                color: '#888',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(13, 13, 13, 0.75)',
              border: '1px solid #2a2a2a',
              color: '#888',
              padding: '4px 10px',
              borderRadius: '6px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
            }}
          >
            {file.name}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <label
        style={{
          display: 'block',
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          letterSpacing: '2px',
          color: '#666',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}
      >
        Pet Photo
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragging ? '#e8c97e' : '#2a2a2a'}`,
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(232, 201, 126, 0.04)' : '#161616',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '14px',
            color: '#666',
            marginBottom: '6px',
          }}
        >
          Drop your pet photo here
        </p>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '12px',
            color: '#444',
          }}
        >
          or click to browse — JPG, PNG, WEBP
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
