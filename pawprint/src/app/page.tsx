'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TabSwitcher from '@/components/TabSwitcher';
import PetProfileForm from '@/components/PetProfileForm';
import ProfileSummaryCard from '@/components/ProfileSummaryCard';
import BreedResultCard from '@/components/BreedResultCard';
import IdentifyPanel from '@/components/IdentifyPanel';
import Footer from '@/components/Footer';
import type { PetProfile, BreedScanResult } from '@/types';

type Stage = 'quiz' | 'summary' | 'result';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'submit' | 'identify'>('submit');
  const [stage, setStage] = useState<Stage>('quiz');
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [scanResult, setScanResult] = useState<BreedScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [testMode, setTestMode] = useState(false);

  const handleProfileComplete = (p: PetProfile) => { setProfile(p); setStage('summary'); };
  const handleScanResult = (result: BreedScanResult, preview: string, isTestMode: boolean) => { setScanResult(result); setImagePreview(preview); setTestMode(isTestMode); setStage('result'); };
  const handleReset = () => { setProfile(null); setScanResult(null); setImagePreview(''); setStage('quiz'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)', transition: 'background 0.25s' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <HeroSection />
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'submit' && (
          <>
            {stage === 'quiz' && <PetProfileForm onComplete={handleProfileComplete} />}
            {stage === 'summary' && profile && (
              <ProfileSummaryCard profile={profile} onResult={handleScanResult} onReset={handleReset} />
            )}
            {stage === 'result' && scanResult && profile && (
              <BreedResultCard result={scanResult} imagePreview={imagePreview} profile={profile} onReset={handleReset} testMode={testMode} />
            )}
          </>
        )}

        {activeTab === 'identify' && <IdentifyPanel onSwitchTab={() => setActiveTab('submit')} />}
      </main>
      <Footer />
    </div>
  );
}
