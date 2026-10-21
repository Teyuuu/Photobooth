import React, { useState } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import { Session } from '@/types';
import {
  History,
  Printer,
  QrCode,
  Download,
  Calendar,
  Sparkles,
  Film,
} from 'lucide-react';

export const SessionsView: React.FC = () => {
  const { recentSessions, selectedPrinter } = usePhotobooth();
  const [selectedSession, setSelectedSession] = useState<Session | null>(
    recentSessions.length > 0 ? recentSessions[0] : null
  );

  const handleReprint = async (session: Session) => {
    if (!session.deliverables.composedImageUrl) return;
    if (window.photoboothAPI?.printPhoto) {
      await window.photoboothAPI.printPhoto({
        imageUrl: session.deliverables.composedImageUrl,
        printerName: selectedPrinter,
        copies: 1,
        paperSize: '4x6',
      });
      alert(`Print job sent to ${selectedPrinter}`);
    } else {
      const w = window.open();
      w?.document.write(
        `<img src="${session.deliverables.composedImageUrl}" onload="window.print();window.close();"/>`
      );
    }
  };

  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <History className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Session History & Archives</h2>
            <p className="text-xs text-muted-foreground">
              Review completed sessions, reprint photo strips, or access digital deliverable assets.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          Total Recorded: {recentSessions.length} Sessions
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left: Sessions List (4 cols) */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground block mb-2">
              Recent Sessions
            </span>

            {recentSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
                <span>No completed sessions yet. Start a session in Live Booth!</span>
              </div>
            ) : (
              recentSessions.map((ses) => {
                const isSelected = selectedSession?.id === ses.id;
                return (
                  <div
                    key={ses.id}
                    onClick={() => setSelectedSession(ses)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/30 border-border hover:bg-muted/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-foreground font-mono">
                          {ses.id.slice(0, 10)}...
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                          {ses.photos.length} Photos
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        {new Date(ses.startedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {ses.deliverables.composedImageUrl && (
                      <div className="w-10 h-14 rounded overflow-hidden bg-black border border-border shrink-0">
                        <img
                          src={ses.deliverables.composedImageUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Session Details & Deliverables (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-border rounded-xl p-6 flex flex-col justify-between overflow-y-auto">
          {selectedSession ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-foreground font-mono">
                    Session: {selectedSession.id}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center space-x-2 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Captured: {new Date(selectedSession.startedAt).toLocaleString()}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReprint(selectedSession)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Reprint 4x6</span>
                  </button>
                </div>
              </div>

              {/* Deliverables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Composed 4x6 Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Print Composition (4x6)</span>
                  </span>
                  {selectedSession.deliverables.composedImageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-border bg-black max-h-80 flex items-center justify-center">
                      <img
                        src={selectedSession.deliverables.composedImageUrl}
                        alt="Composed 4x6"
                        className="max-h-80 w-auto object-contain"
                      />
                      <button
                        onClick={() =>
                          handleDownload(
                            selectedSession.deliverables.composedImageUrl!,
                            `composition_${selectedSession.id}.jpg`
                          )
                        }
                        className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                        title="Download JPG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Not generated</div>
                  )}
                </div>

                {/* Animated GIF */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground flex items-center space-x-1.5">
                    <Film className="w-3.5 h-3.5 text-accent" />
                    <span>Animated GIF</span>
                  </span>
                  {selectedSession.deliverables.gifUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-border bg-black max-h-80 flex items-center justify-center">
                      <img
                        src={selectedSession.deliverables.gifUrl}
                        alt="GIF Animation"
                        className="max-h-80 w-auto object-contain"
                      />
                      <button
                        onClick={() =>
                          handleDownload(
                            selectedSession.deliverables.gifUrl!,
                            `animation_${selectedSession.id}.gif`
                          )
                        }
                        className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                        title="Download GIF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground p-8 bg-muted/20 rounded-lg text-center">
                      GIF disabled or not created for this session
                    </div>
                  )}
                </div>

                {/* QR Code & Gallery URL */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground flex items-center space-x-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Digital Gallery QR</span>
                  </span>
                  {selectedSession.deliverables.qrCodeUrl ? (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
                      <img
                        src={selectedSession.deliverables.qrCodeUrl}
                        alt="QR Code"
                        className="w-36 h-36 object-contain"
                      />
                      <span className="text-[10px] font-bold text-slate-800 mt-2">
                        Token: {selectedSession.deliverables.galleryToken?.slice(0, 8)}...
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">No QR code</div>
                  )}
                </div>
              </div>

              {/* Individual Captures Reel */}
              <div className="pt-4 border-t border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Original Captures ({selectedSession.photos.length} Raw Frames)
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {selectedSession.photos.map((p, i) => (
                    <div
                      key={p.id}
                      className="relative rounded-lg overflow-hidden border border-border aspect-[3/2] bg-black group"
                    >
                      <img
                        src={p.originalDataUrl}
                        alt={`Raw ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                        Shot #{i + 1}
                      </span>
                      <button
                        onClick={() => handleDownload(p.originalDataUrl, `raw_${selectedSession.id}_${i + 1}.jpg`)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="Download Raw Photo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-muted-foreground text-xs">
              Select a session from the list to view its photos, reprint, or download deliverables.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
