import React, { useEffect } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import confetti from 'canvas-confetti';
import { Camera, Sparkles, QrCode, Heart, CheckCircle2 } from 'lucide-react';

export const GuestScreen: React.FC = () => {
  const {
    activeEvent,
    sessionState,
    countdownRemaining,
    currentShotIndex,
    currentSession,
    isFlashing,
    startSession,
  } = usePhotobooth();

  // Trigger celebratory confetti on delivery state
  useEffect(() => {
    if (sessionState === 'delivering') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
      });
    }
  }, [sessionState]);

  const shotsCount = activeEvent.captureSettings.shotsCount || 3;

  return (
    <div className="relative w-screen h-screen bg-[#030712] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Full-screen Flash Shutter Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* Background Ambient Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Header: Event Branding */}
      <header className="px-12 py-8 flex items-center justify-between z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
            <span>{activeEvent.branding.eventName || activeEvent.name}</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-spin-slow" />
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            {activeEvent.branding.subtitle || 'Photobooth Studio'}
          </p>
        </div>

        {sessionState !== 'idle' && (
          <div className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center space-x-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold tracking-wide">
              {sessionState === 'delivering'
                ? 'COMPLETED'
                : `PHOTO ${Math.min(currentShotIndex + 1, shotsCount)} OF ${shotsCount}`}
            </span>
          </div>
        )}
      </header>

      {/* Center: Stage Content according to State Machine */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 z-10">
        {/* 1. IDLE / WELCOME STATE */}
        {sessionState === 'idle' && (
          <div
            onClick={startSession}
            className="flex flex-col items-center text-center cursor-pointer group transition-transform duration-300 hover:scale-105"
          >
            <div className="relative mb-8">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:shadow-primary/50 transition-all">
                <Camera className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-30 pointer-events-none" />
            </div>

            <h2 className="text-5xl font-black tracking-tight text-white mb-4">
              {activeEvent.branding.welcomeMessage || 'Touch Screen to Start'}
            </h2>
            <p className="text-lg text-slate-400 max-w-md">
              Grab your friends, get ready for {shotsCount} amazing photos, and print your keepsake!
            </p>

            <div className="mt-8 px-8 py-3.5 rounded-full bg-white text-slate-950 font-bold text-base shadow-xl flex items-center space-x-3 group-hover:bg-primary group-hover:text-white transition-all">
              <span>START PHOTO SESSION</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        )}

        {/* 2. PREPARING STATE */}
        {sessionState === 'preparing' && (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-2">Get Ready!</h2>
            <p className="text-lg text-slate-400">Position yourself in front of the camera...</p>
          </div>
        )}

        {/* 3. COUNTDOWN STATE */}
        {sessionState === 'countdown' && (
          <div className="text-center flex flex-col items-center">
            <div className="text-slate-400 font-semibold tracking-wider text-xl uppercase mb-4">
              Photo {currentShotIndex + 1} of {shotsCount}
            </div>

            {/* Huge Animated Number */}
            <div className="relative flex items-center justify-center w-56 h-56 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="text-9xl font-black text-white drop-shadow-2xl animate-bounce">
                {countdownRemaining}
              </div>
            </div>

            <div className="text-2xl font-bold text-amber-300 tracking-wide flex items-center space-x-2">
              <Heart className="w-6 h-6 fill-amber-300" />
              <span>
                {countdownRemaining === 1
                  ? 'Say Cheese!'
                  : countdownRemaining === 2
                  ? 'Big Smiles!'
                  : 'Strike a Pose!'}
              </span>
            </div>
          </div>
        )}

        {/* 4. CAPTURING / FLASH */}
        {sessionState === 'capturing' && (
          <div className="text-center">
            <h2 className="text-5xl font-black text-white tracking-wide animate-pulse">
              📸 SNAP!
            </h2>
          </div>
        )}

        {/* 5. REVIEWING SHOT */}
        {sessionState === 'reviewing' && currentSession?.photos.length && (
          <div className="text-center animate-fade-in max-w-xl">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 mb-6 bg-slate-900 aspect-[3/2] max-h-72 mx-auto">
              <img
                src={currentSession.photos[currentSession.photos.length - 1].originalDataUrl}
                alt="Captured Shot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-xs font-semibold text-white backdrop-blur-md">
                Shot {currentSession.photos.length} Captured
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Looking Great!</h3>
            <p className="text-slate-400">
              {currentSession.photos.length < shotsCount
                ? `Next shot starting in a moment...`
                : `Finalizing your photos...`}
            </p>
          </div>
        )}

        {/* 6. PROCESSING STATE */}
        {sessionState === 'processing' && (
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold text-white mb-2">Creating Your Layout...</h2>
            <p className="text-slate-400">Generating print-ready photo strip & animated GIF</p>
          </div>
        )}

        {/* 7. DELIVERING / QR / FINISHED STATE */}
        {sessionState === 'delivering' && currentSession && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl animate-fade-in">
            {/* Composed Print Preview */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/20 max-h-[460px] bg-slate-900 shrink-0">
              {currentSession.deliverables.composedImageUrl ? (
                <img
                  src={currentSession.deliverables.composedImageUrl}
                  alt="Final Print Composition"
                  className="max-h-[460px] w-auto object-contain"
                />
              ) : (
                <div className="w-64 h-96 flex items-center justify-center text-slate-400">
                  Rendering...
                </div>
              )}
            </div>

            {/* QR Code & Digital Access Instructions */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5" />
                <span>Session Complete!</span>
              </div>

              <h2 className="text-4xl font-extrabold text-white">Scan to Get Your Photos</h2>
              <p className="text-slate-300 text-sm max-w-sm">
                Point your phone camera at this QR code to download your individual photos, final print composition, and animated GIF.
              </p>

              {currentSession.deliverables.qrCodeUrl && (
                <div className="p-4 bg-white rounded-2xl shadow-2xl border border-white/30 inline-block">
                  <img
                    src={currentSession.deliverables.qrCodeUrl}
                    alt="Gallery QR Code"
                    className="w-48 h-48 object-contain"
                  />
                  <div className="text-center text-[11px] font-bold text-slate-800 mt-2 flex items-center justify-center space-x-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Instant Digital Download</span>
                  </div>
                </div>
              )}

              {/* Printing Status notice */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Your physical print is currently being prepared by the printer.</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer: Privacy Notice & Ready indicator */}
      <footer className="px-12 py-6 flex items-center justify-between text-xs text-slate-400/80 border-t border-white/5 z-10">
        <div>
          {activeEvent.branding.privacyNotice ||
            'Photos are stored securely and accessible only via your private QR code.'}
        </div>
        <div className="flex items-center space-x-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>PHOTOBOOTH READY</span>
        </div>
      </footer>
    </div>
  );
};
