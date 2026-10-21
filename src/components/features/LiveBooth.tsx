import React, { useEffect, useState } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import {
  Camera,
  Play,
  RotateCcw,
  Printer,
  XCircle,
  CheckCircle,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export const LiveBooth: React.FC = () => {
  const {
    activeEvent,
    activeTemplate,
    sessionState,
    countdownRemaining,
    currentShotIndex,
    currentSession,
    startSession,
    cancelSession,
    retakeShot,
    finishSession,
    resetToIdle,
    printSession,
    testCapture,
    cameraAdapterType,
    cameraStatus,
    selectedPrinter,
    launchGuestDisplay,
  } = usePhotobooth();

  const [mirrorView, setMirrorView] = useState(true);
  const [printCopies, setPrintCopies] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [testImage, setTestImage] = useState<string | null>(null);

  // Global Spacebar shortcut to start session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && sessionState === 'idle' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        startSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionState, startSession]);

  const targetShots = activeEvent.captureSettings.shotsCount || 3;
  const isSessionRunning = sessionState !== 'idle' && sessionState !== 'completed' && sessionState !== 'error';

  const handlePrint = async () => {
    setIsPrinting(true);
    await printSession(printCopies);
    setIsPrinting(false);
  };

  const handleTestCapture = async () => {
    const img = await testCapture();
    setTestImage(img);
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Top Banner: Status & Quick Action Bar */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              isSessionRunning
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            {isSessionRunning ? <Camera className="w-6 h-6 animate-pulse" /> : <Play className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-foreground">
                {sessionState === 'idle' && 'Booth Ready for Next Guest'}
                {sessionState === 'preparing' && 'Preparing Session...'}
                {sessionState === 'countdown' && `Photo ${currentShotIndex + 1} Countdown: ${countdownRemaining}s`}
                {sessionState === 'capturing' && 'Capturing Photo...'}
                {sessionState === 'reviewing' && `Reviewing Photo ${currentSession?.photos.length || 0}`}
                {sessionState === 'processing' && 'Rendering Composition & GIF...'}
                {sessionState === 'delivering' && 'Session Complete (Showing QR)'}
                {sessionState === 'error' && 'Session Error'}
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-muted text-muted-foreground uppercase tracking-wide">
                State: {sessionState}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Template: <span className="text-foreground font-medium">{activeTemplate.name}</span> • Camera:{' '}
              <span className="text-foreground font-medium capitalize">{cameraAdapterType}</span> ({cameraStatus})
            </p>
          </div>
        </div>

        {/* Primary Operational Action Buttons */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {sessionState === 'idle' ? (
            <button
              onClick={startSession}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all text-sm group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>START SESSION [Space]</span>
            </button>
          ) : (
            <>
              {isSessionRunning && (
                <button
                  onClick={finishSession}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Finish Early</span>
                </button>
              )}

              <button
                onClick={cancelSession}
                className="px-4 py-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <button
                onClick={resetToIdle}
                className="px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Idle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Left Viewfinder / Right Capture Reel & Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[460px]">
        {/* Left: Viewfinder & Live Camera Feed (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Live Camera Viewfinder</span>
              <span className="text-xs text-muted-foreground font-mono">
                {cameraStatus === 'connected' ? '• 30 FPS Stream' : '• Standby'}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <label className="flex items-center space-x-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={mirrorView}
                  onChange={(e) => setMirrorView(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0"
                />
                <span>Mirror View</span>
              </label>

              <button
                onClick={handleTestCapture}
                className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-medium text-xs transition-colors"
              >
                Test Shutter
              </button>

              <button
                onClick={launchGuestDisplay}
                title="Launch Guest Screen Window"
                className="px-2.5 py-1 rounded bg-accent/10 hover:bg-accent/20 text-accent font-medium text-xs transition-colors flex items-center space-x-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Guest Window</span>
              </button>
            </div>
          </div>

          {/* Viewfinder Preview Box */}
          <div className="relative flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-border min-h-[320px]">
            {/* Viewfinder framing guide */}
            <div className="absolute inset-8 border border-white/20 rounded-md pointer-events-none z-10 flex flex-col justify-between p-4">
              <div className="flex justify-between text-[11px] font-mono text-white/50">
                <span>AF-C [CENTER]</span>
                <span>3:2 SAFE FRAME</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-white/50">
                <span>{cameraAdapterType.toUpperCase()}</span>
                <span>300 DPI READY</span>
              </div>
            </div>

            {/* Simulated / Real Capture Canvas */}
            {testImage ? (
              <img
                src={testImage}
                alt="Test View"
                className={`w-full h-full object-cover ${mirrorView ? 'scale-x-[-1]' : ''}`}
              />
            ) : currentSession?.photos.length ? (
              <img
                src={currentSession.photos[currentSession.photos.length - 1].originalDataUrl}
                alt="Latest Capture"
                className={`w-full h-full object-cover ${mirrorView ? 'scale-x-[-1]' : ''}`}
              />
            ) : (
              <div className="flex flex-col items-center text-center p-6 text-muted-foreground">
                <Camera className="w-12 h-12 mb-3 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">
                  {cameraAdapterType === 'mock'
                    ? 'Virtual Studio DSLR Active'
                    : cameraAdapterType === 'webcam'
                    ? 'Webcam DirectShow Active'
                    : 'Tethered DSLR Active'}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Ready to capture high-resolution photos on session start.
                </p>
              </div>
            )}

            {/* Countdown Overlay if active */}
            {sessionState === 'countdown' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <span className="text-8xl font-black text-white drop-shadow-lg animate-bounce">
                  {countdownRemaining}
                </span>
                <span className="text-sm font-semibold text-amber-300 mt-2 uppercase tracking-wider">
                  Photo {currentShotIndex + 1} of {targetShots}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Captured Photos Reel & Delivery Controls (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <span className="font-semibold text-sm">Session Captures ({currentSession?.photos.length || 0}/{targetShots})</span>
              <span className="text-xs text-muted-foreground">
                Retakes: {currentSession?.retakesUsed || 0}/{activeEvent.captureSettings.maxRetakes || 1}
              </span>
            </div>

            {/* Shots Thumbnails Reel */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Array.from({ length: targetShots }).map((_, idx) => {
                const photo = currentSession?.photos[idx];
                return (
                  <div
                    key={idx}
                    className="relative aspect-[3/2] bg-muted/40 rounded-lg border border-border overflow-hidden flex flex-col items-center justify-center group"
                  >
                    {photo ? (
                      <>
                        <img
                          src={photo.originalDataUrl}
                          alt={`Shot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white">
                          #{idx + 1}
                        </div>
                        {isSessionRunning && (
                          <button
                            onClick={() => retakeShot(idx)}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-semibold transition-opacity"
                          >
                            <RotateCcw className="w-4 h-4 mb-1 text-amber-400" />
                            <span>Retake</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-2 text-muted-foreground/50">
                        <Camera className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-[10px] font-medium">Shot {idx + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Delivery & Print Panel */}
            {currentSession?.deliverables.composedImageUrl ? (
              <div className="space-y-4 pt-3 border-t border-border animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Finished 4x6 Composition</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">300 DPI Export Ready</span>
                </div>

                <div className="flex gap-4 items-center">
                  {/* Composed Thumbnail */}
                  <div className="w-24 h-32 rounded-lg border border-border overflow-hidden bg-black shrink-0">
                    <img
                      src={currentSession.deliverables.composedImageUrl}
                      alt="Composed Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* QR Code Preview */}
                  {currentSession.deliverables.qrCodeUrl && (
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white border border-slate-200">
                      <img
                        src={currentSession.deliverables.qrCodeUrl}
                        alt="Gallery QR"
                        className="w-20 h-20 object-contain"
                      />
                      <span className="text-[9px] font-bold text-slate-800 mt-1">Scan for Photos</span>
                    </div>
                  )}

                  {/* GIF preview thumbnail if created */}
                  {currentSession.deliverables.gifUrl && (
                    <div className="w-24 h-24 rounded-lg border border-border overflow-hidden bg-black flex flex-col items-center justify-center relative">
                      <img
                        src={currentSession.deliverables.gifUrl}
                        alt="GIF Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 bg-black/70 px-1 text-[8px] font-bold text-white rounded">
                        GIF
                      </span>
                    </div>
                  )}
                </div>

                {/* Print Controls */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-muted-foreground">Copies:</span>
                    <select
                      value={printCopies}
                      onChange={(e) => setPrintCopies(Number(e.target.value))}
                      className="bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
                    >
                      <option value={1}>1 Copy</option>
                      <option value={2}>2 Copies</option>
                      <option value={3}>3 Copies</option>
                      <option value={4}>4 Copies</option>
                    </select>
                  </div>

                  <button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isPrinting ? 'Submitting...' : `Print to ${selectedPrinter.split(' ')[0]}`}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-lg border border-dashed border-border">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
                <span>Captured photos and 300 DPI print output will appear here.</span>
              </div>
            )}
          </div>

          {/* Bottom Tips / Hardware quick info */}
          <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target: {selectedPrinter} (4x6 borderless)</span>
            </span>
            <span className="font-mono">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
