import React from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import {
  Camera,
  Printer,
  Monitor,
  Cloud,
  Sun,
  Moon,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeEvent,
    cameraStatus,
    cameraAdapterType,
    printers,
    selectedPrinter,
    monitors,
    isGuestWindowOpen,
    launchGuestDisplay,
    theme,
    setTheme,
    simplifiedMode,
    setSimplifiedMode,
  } = usePhotobooth();

  const isPrinterOnline = printers.some((p) => p.name === selectedPrinter && p.status === 'online');

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Active Event & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            PB
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm tracking-tight text-foreground">
                {activeEvent.name}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Ready
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{activeEvent.branding.subtitle || 'Photobooth Studio OS'}</p>
          </div>
        </div>
      </div>

      {/* Center: Hardware Status Indicators */}
      <div className="hidden md:flex items-center space-x-3">
        {/* Camera Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              cameraStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : cameraStatus === 'busy'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <Camera className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground capitalize">
            {cameraAdapterType === 'mock' ? 'Demo Camera' : cameraAdapterType.toUpperCase()}
          </span>
          <span className="text-[10px] text-muted-foreground">({cameraStatus})</span>
        </div>

        {/* Printer Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              isPrinterOnline || selectedPrinter.includes('L3250') ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <Printer className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground truncate max-w-[140px]">
            {selectedPrinter ? selectedPrinter.replace(/Series.*/, 'Series') : 'No Printer'}
          </span>
          <span className="text-[10px] text-emerald-400">Ready</span>
        </div>

        {/* Guest Display Status */}
        <button
          onClick={launchGuestDisplay}
          title="Click to launch or move guest display"
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted border border-border text-xs transition-colors"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isGuestWindowOpen ? 'bg-emerald-500' : 'bg-muted-foreground'
            }`}
          />
          <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">
            {monitors.length > 1 ? `Dual Screen (${monitors.length})` : 'Single Screen'}
          </span>
          <Maximize2 className="w-3 h-3 text-muted-foreground ml-1" />
        </button>

        {/* Cloud/Sync Status */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
          <span>Local First</span>
        </div>
      </div>

      {/* Right: Quick Controls & Theme */}
      <div className="flex items-center space-x-2">
        {/* Simplified Mode Button */}
        <button
          onClick={() => setSimplifiedMode(!simplifiedMode)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            simplifiedMode
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-muted/40 hover:bg-muted text-muted-foreground border border-border'
          }`}
          title="Simplified mode hides technical settings for event staff"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{simplifiedMode ? 'Operator Mode' : 'Standard Mode'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border transition-colors"
          title="Toggle light/dark theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
