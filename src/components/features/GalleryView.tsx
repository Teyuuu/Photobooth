import React, { useState } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import {
  QrCode,
  Cloud,
  Wifi,
  ShieldCheck,
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { activeEvent, setActiveEvent } = usePhotobooth();
  const [galleryUrl, setGalleryUrl] = useState(activeEvent.gallerySettings.qrBaseUrl);
  const [isCloudEnabled] = useState(activeEvent.gallerySettings.cloudEnabled);
  const [localFallback, setLocalFallback] = useState(activeEvent.gallerySettings.localFallbackEnabled);
  const [expirationHours, setExpirationHours] = useState(activeEvent.gallerySettings.expirationHours);

  const handleSave = () => {
    setActiveEvent({
      ...activeEvent,
      gallerySettings: {
        ...activeEvent.gallerySettings,
        qrBaseUrl: galleryUrl,
        cloudEnabled: isCloudEnabled,
        localFallbackEnabled: localFallback,
        expirationHours,
      },
    });
    alert('Gallery settings updated.');
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <QrCode className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Digital Gallery & Cloud Sync</h2>
            <p className="text-xs text-muted-foreground">
              Configure guest QR code destination, offline LAN fallback, and Supabase cloud upload queue.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-sm"
        >
          Save Gallery Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. QR Code & Gallery Destination */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center space-x-2 border-b border-border pb-2">
            <QrCode className="w-4 h-4 text-primary" />
            <span>QR Code Route & Token Behavior</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Public / Netlify Gallery Base URL
              </label>
              <input
                type="text"
                value={galleryUrl}
                onChange={(e) => setGalleryUrl(e.target.value)}
                placeholder="https://photobooth-gallery.netlify.app/session/"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                A secure random 128-bit unguessable session token is automatically appended to this URL for each guest session.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Gallery Expiration Time
              </label>
              <select
                value={expirationHours}
                onChange={(e) => setExpirationHours(Number(e.target.value))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground"
              >
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours (Recommended)</option>
                <option value={168}>7 Days</option>
                <option value={720}>30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Offline Resilience & Local LAN Fallback */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center space-x-2 border-b border-border pb-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>Local Offline Fallback Mode</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40 border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={localFallback}
                onChange={(e) => setLocalFallback(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-foreground block">
                  Enable Local LAN Gallery Fallback
                </span>
                <span className="text-muted-foreground">
                  If the venue loses internet connectivity, the guest QR code can link to the photobooth PC local IP address on the local Wi-Fi router.
                </span>
              </div>
            </label>

            <div className="p-3 bg-muted/20 border border-border/50 rounded-lg text-xs space-y-1.5 text-muted-foreground">
              <div className="flex items-center space-x-1.5 text-foreground font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Local-First Guarantee</span>
              </div>
              <p>
                All captures, compositions, and GIFs are written immediately to local disk. An internet outage will never block taking photos or printing on the Epson L3250.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Cloud Synchronization Queue Status */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Background Sync Queue</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Queue Idle • 0 Pending</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <span className="text-2xl font-bold text-foreground">0</span>
              <span className="text-xs text-muted-foreground block mt-1">Pending Uploads</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <span className="text-2xl font-bold text-emerald-400">100%</span>
              <span className="text-xs text-muted-foreground block mt-1">Local Storage Integrity</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <span className="text-2xl font-bold text-foreground">Active</span>
              <span className="text-xs text-muted-foreground block mt-1">Local First Cache</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
