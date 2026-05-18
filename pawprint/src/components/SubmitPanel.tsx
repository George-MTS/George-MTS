'use client';

import { useState } from 'react';
import UploadZone from './UploadZone';
import PetTypeSelector from './PetTypeSelector';
import AnalysisResult from './AnalysisResult';
import type { AIAnalysisResult, AnalyseAPIResponse } from '@/types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#161616',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#f0ede8',
  fontFamily: "'DM Mono', monospace",
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Mono', monospace",
  fontSize: '11px',
  letterSpacing: '2px',
  color: '#666',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
};

export default function SubmitPanel() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [petName, setPetName] = useState('');
  const [origin, setOrigin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [twitter, setTwitter] = useState('');
  const [traits, setTraits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please upload a photo of your pet.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('petType', petType);
    formData.append('breed', breed);
    formData.append('age', age);
    formData.append('petName', petName);
    formData.append('origin', origin);
    formData.append('ownerName', ownerName);
    formData.append('twitter', twitter);
    formData.append('traits', traits);

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      });

      const data: AnalyseAPIResponse = await res.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || 'Analysis failed. Please try again.');
      }

      setResult(data.result);
      setResultImageUrl(data.imageUrl || imagePreview || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = `
    input:focus, select:focus, textarea:focus {
      border-color: #e8c97e !important;
      box-shadow: 0 0 0 2px rgba(232, 201, 126, 0.1);
    }
  `;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
      <style>{focusStyle}</style>
      <form onSubmit={handleSubmit}>
        <UploadZone
          file={imageFile}
          preview={imagePreview}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
        />

        <PetTypeSelector value={petType} onChange={setPetType} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '4px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Breed (optional)</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Golden Retriever"
              style={inputStyle}
            />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Age</label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Select age range</option>
              <option value="Under 1 year">Under 1 year</option>
              <option value="1–3 years">1–3 years</option>
              <option value="4–7 years">4–7 years</option>
              <option value="8–12 years">8–12 years</option>
              <option value="13+ years">13+ years</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '4px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Pet Name</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Buddy"
              style={inputStyle}
            />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Country / Region of Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. United Kingdom"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '4px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Your Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Sarah"
              style={inputStyle}
            />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Twitter Handle (optional)</label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@yourhandle"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ ...fieldGroupStyle, marginBottom: '28px' }}>
          <label style={labelStyle}>Character Traits & Notes</label>
          <textarea
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            placeholder="Describe your pet's personality, habits, any notable traits..."
            rows={4}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '100px',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(220, 80, 80, 0.1)',
              border: '1px solid rgba(220, 80, 80, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '13px',
              color: '#f08080',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '10px',
            border: 'none',
            background: loading ? '#3a3328' : '#e8c97e',
            color: loading ? '#888' : '#0d0d0d',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Mono', monospace",
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s',
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #666',
                  borderTopColor: '#e8c97e',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              Analysing with AI...
            </>
          ) : (
            'Analyse My Pet with AI ✦'
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      {result && resultImageUrl && (
        <AnalysisResult
          result={result}
          imageUrl={resultImageUrl}
          petName={petName}
          petType={petType}
        />
      )}
    </div>
  );
}
