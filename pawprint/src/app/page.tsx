'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TabSwitcher from '@/components/TabSwitcher';
import SubmitPanel from '@/components/SubmitPanel';
import IdentifyPanel from '@/components/IdentifyPanel';
import Footer from '@/components/Footer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'submit' | 'identify'>('submit');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0d0d',
      }}
    >
      <Header />

      <main style={{ flex: 1 }}>
        <HeroSection />
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'submit' ? (
          <SubmitPanel />
        ) : (
          <IdentifyPanel onSwitchTab={() => setActiveTab('submit')} />
        )}
      </main>

      <Footer />
    </div>
  );
}
