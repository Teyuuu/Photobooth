import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { LiveBooth } from '@/components/features/LiveBooth';
import { EventsView } from '@/components/features/EventsView';
import { TemplatesView } from '@/components/features/TemplatesView';
import { SessionsView } from '@/components/features/SessionsView';
import { HardwareView } from '@/components/features/HardwareView';
import { GalleryView } from '@/components/features/GalleryView';
import { SettingsView } from '@/components/features/SettingsView';
import { SetupWizard } from '@/components/features/SetupWizard';
import { GuestScreen } from '@/components/guest/GuestScreen';

export const App: React.FC = () => {
  // Check if current window was opened as the dedicated Guest Display
  const searchParams = new URLSearchParams(window.location.search);
  const isGuestMode = searchParams.get('mode') === 'guest';

  const [currentTab, setCurrentTab] = useState<string>('live');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // If opened as the guest window, render only the guest UI
  if (isGuestMode) {
    return <GuestScreen />;
  }

  // Otherwise render the full Operator Workspace
  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Top Status & Telemetry Bar */}
      <Navbar />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openWizard={() => setIsWizardOpen(true)}
        />

        {/* Workspace Views */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background/50">
          {currentTab === 'live' && <LiveBooth />}
          {currentTab === 'events' && <EventsView />}
          {currentTab === 'templates' && <TemplatesView />}
          {currentTab === 'sessions' && <SessionsView />}
          {currentTab === 'hardware' && <HardwareView />}
          {currentTab === 'gallery' && <GalleryView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Operator Setup Wizard Modal */}
      <SetupWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
};

export default App;
