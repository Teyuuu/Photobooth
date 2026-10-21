import React, { useEffect, useState } from 'react';
import { DiagnosticInfo } from '@/types';
import {
  Settings,
  HardDrive,
  Cpu,
  RotateCcw,
  FolderOpen,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);

  useEffect(() => {
    if (window.photoboothAPI?.getDiagnostics) {
      window.photoboothAPI.getDiagnostics().then(setDiagnostics);
    } else {
      setDiagnostics({
        appVersion: '1.0.0 Pro',
        electronVersion: '33.2.0',
        chromeVersion: '130.0',
        nodeVersion: '24.8.0',
        platform: 'win32 (Windows 10/11)',
        osRelease: '10.0.26100',
        monitors: [],
        printers: [],
        activeCamera: 'Virtual Studio / Webcam',
        activePrinter: 'EPSON83442C (L3250 Series)',
        storage: {
          appDataPath: 'C:\\Users\\MIS\\AppData\\Roaming\\PhotoboothData',
          totalSessions: 12,
          totalPhotos: 36,
          diskUsedMb: 14.8,
          diskFreeMb: 145000,
        },
      });
    }
  }, []);

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to restore default application settings?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">System Settings & Diagnostic Telemetry</h2>
            <p className="text-xs text-muted-foreground">
              Review Windows system integration, storage path allocations, and hardware health.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 font-semibold text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Factory Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Diagnostics */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center space-x-2 border-b border-border pb-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span>Runtime Environment</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Application:</span>
              <span className="font-mono text-foreground">{diagnostics?.appVersion || '1.0.0'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Operating System:</span>
              <span className="font-mono text-foreground">{diagnostics?.platform || 'Windows'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Node.js Engine:</span>
              <span className="font-mono text-foreground">{diagnostics?.nodeVersion || 'v24.8.0'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Electron Shell:</span>
              <span className="font-mono text-foreground">{diagnostics?.electronVersion || '33.2.0'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Chromium Blink:</span>
              <span className="font-mono text-foreground">{diagnostics?.chromeVersion || '130.0'}</span>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center space-x-2 border-b border-border pb-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Local Storage & Retention</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block mb-1">Local AppData Directory:</span>
              <div className="p-2.5 rounded-lg bg-muted/60 font-mono text-[11px] text-foreground break-all border border-border flex items-center justify-between">
                <span>{diagnostics?.storage.appDataPath || 'C:\\Users\\MIS\\AppData\\Roaming\\PhotoboothData'}</span>
                <FolderOpen className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <span className="text-muted-foreground block">Local Media Used:</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {diagnostics?.storage.diskUsedMb || 12} MB
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <span className="text-muted-foreground block">Free Disk Space:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {Math.round((diagnostics?.storage.diskFreeMb || 100000) / 1024)} GB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
