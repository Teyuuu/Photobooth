import React from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import {
  Camera,
  Calendar,
  Layers,
  History,
  Sliders,
  Settings,
  Sparkles,
  QrCode,
  Wand2,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openWizard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, openWizard }) => {
  const { simplifiedMode, sessionState } = usePhotobooth();

  const isSessionActive = sessionState !== 'idle' && sessionState !== 'completed' && sessionState !== 'error';

  const navItems = [
    { id: 'live', label: 'Live Booth', icon: Camera, badge: isSessionActive ? 'Active' : undefined },
    { id: 'events', label: 'Events', icon: Calendar, hideInSimple: true },
    { id: 'templates', label: 'Templates', icon: Layers, hideInSimple: true },
    { id: 'sessions', label: 'Sessions', icon: History },
    { id: 'hardware', label: 'Printer & Camera', icon: Sliders },
    { id: 'gallery', label: 'Gallery & QR', icon: QrCode, hideInSimple: true },
    { id: 'settings', label: 'Settings', icon: Settings, hideInSimple: true },
  ];

  const visibleItems = simplifiedMode ? navItems.filter((i) => !i.hideInSimple) : navItems;

  return (
    <aside className="w-56 border-r border-border bg-card/60 backdrop-blur-md flex flex-col justify-between py-4 select-none shrink-0">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="px-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Setup Wizard button */}
      <div className="px-3 space-y-2">
        <button
          onClick={openWizard}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-accent-foreground bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all"
        >
          <Wand2 className="w-4 h-4 text-accent" />
          <span>Setup Wizard</span>
        </button>

        <div className="px-3 py-2 text-[11px] text-muted-foreground/80 flex items-center justify-between">
          <span>v1.0.0 Pro</span>
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Ready</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
