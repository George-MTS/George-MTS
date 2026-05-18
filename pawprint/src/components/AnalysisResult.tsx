'use client';

import { useEffect, useRef } from 'react';
import type { AIAnalysisResult } from '@/types';

interface AnalysisResultProps {
  result: AIAnalysisResult;
  imageUrl: string;
  petName?: string;
  petType: 'dog' | 'cat';
}

export default function AnalysisResult({ result, imageUrl, petName, petType }: AnalysisResultProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--target-width', `${result.confidence}%`);
    }
  }, [result.confidence]);

  const tweetText = `Just found out ${petName || 'my pet'} is a ${result.breedIdentified}! 🐾\n\nPawPrint AI analysed the photo and gave me a full breed profile — temperament, care tips, traits, everything.\n\nTry it free 👇\nhttps://pawprint.app\n\n#PawPrint #PetAI ${petType === 'dog' ? '#DogsOfTwitter' : '#CatsOfTwitter'}`;

  const handleShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    );
  };

  const fieldStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '13px',
    color: '#888',
    lineHeight: 1.7,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#555',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  };

  return (
    <div
      className="slide-in"
      style={{
        marginTop: '32px',
        border: '1px solid #2a2a2a',
        borderRadius: '16px',
        background: '#1e1e1e',
        overflow: 'hidden',
      }}
    >
      {/* Photo + Breed Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr',
          gap: '0',
        }}
      >
        <div
          style={{
            height: '160px',
            overflow: 'hidden',
          }}
        >
          <img
            src={imageUrl}
            alt="Analysed pet"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
        <div
          style={{
            padding: '20px 24px',
            borderLeft: '1px solid #2a2a2a',
          }}
        >
          <p style={labelStyle}>Breed Identified</p>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '24px',
              color: '#f0ede8',
              lineHeight: 1.2,
              marginBottom: '6px',
              letterSpacing: '-0.5px',
            }}
          >
            {result.breedIdentified}
          </h2>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
              color: '#666',
              marginBottom: '14px',
            }}
          >
            {petType === 'dog' ? '🐕' : '🐈'} {petType.charAt(0).toUpperCase() + petType.slice(1)}
            {result.origin && ` · ${result.origin}`}
            {petName && ` · "${petName}"`}
          </p>

          {/* Confidence */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <p style={{ ...labelStyle, marginBottom: 0 }}>AI Confidence</p>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '13px',
                  color: '#e8c97e',
                }}
              >
                {result.confidence}%
              </span>
            </div>
            <div
              style={{
                height: '4px',
                background: '#2a2a2a',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                ref={barRef}
                className="confidence-bar"
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #c47f5a, #e8c97e)',
                  borderRadius: '2px',
                  width: '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px', borderTop: '1px solid #2a2a2a' }}>
        {/* Temperament */}
        <div style={{ marginBottom: '24px' }}>
          <p style={labelStyle}>Character Profile</p>
          <p style={fieldStyle}>{result.temperament}</p>
        </div>

        {/* Traits Grid */}
        <div style={{ marginBottom: '24px' }}>
          <p style={labelStyle}>Breed Traits</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
            }}
          >
            {result.traits.map((trait, i) => (
              <div
                key={i}
                style={{
                  background: '#161616',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    color: '#555',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  {trait.label}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '13px',
                    color: '#c8c4bc',
                  }}
                >
                  {trait.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Care Notes */}
        <div style={{ marginBottom: '24px' }}>
          <p style={labelStyle}>Care & Origin Notes</p>
          <p style={fieldStyle}>{result.careNotes}</p>
        </div>

        {/* Fun Fact */}
        <div
          style={{
            background: 'rgba(232, 201, 126, 0.06)',
            border: '1px solid rgba(232, 201, 126, 0.2)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '2px',
              color: '#e8c97e',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            ✦ Fun Fact
          </p>
          <p style={{ ...fieldStyle, color: '#c8c4bc' }}>{result.funFact}</p>
        </div>

        {/* Similar Breeds */}
        {result.similarBreeds && result.similarBreeds.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={labelStyle}>Similar Breeds</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {result.similarBreeds.map((breed, i) => (
                <span
                  key={i}
                  style={{
                    background: '#161616',
                    border: '1px solid #2a2a2a',
                    color: '#888',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '12px',
                  }}
                >
                  {breed}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #2a2a2a',
            background: '#161616',
            color: '#f0ede8',
            cursor: 'pointer',
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#e8c97e';
            e.currentTarget.style.color = '#e8c97e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2a2a2a';
            e.currentTarget.style.color = '#f0ede8';
          }}
        >
          <span style={{ fontSize: '16px' }}>𝕏</span>
          Share on Twitter / X
        </button>
      </div>
    </div>
  );
}
