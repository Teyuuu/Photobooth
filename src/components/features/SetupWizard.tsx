import React, { useState } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import {
  Wand2,
  Monitor,
  Camera,
  Printer,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ isOpen, onClose }) => {
  const {
    monitors,
    selectedGuestMonitorId,
    setSelectedGuestMonitorId,
    launchGuestDisplay,
    cameraAdapterType,
    setCameraAdapterType,
    selectedPrinter,
    setSelectedPrinter,
    printers,
    activeEvent,
    testCapture,
  } = usePhotobooth();

  const [step, setStep] = useState(1);
  const [testShotDone, setTestShotDone] = useState(false);

  if (!isOpen) return null;

  const handleTestShutter = async () => {
    try {
      await testCapture();
      setTestShotDone(true);
    } catch {
      alert('Camera test failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center space-x-2.5">
            <Wand2 className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-sm text-foreground">Photobooth Operator Pre-Flight Wizard</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="grid grid-cols-4 border-b border-border text-center text-xs">
          {[
            { s: 1, label: 'Displays' },
            { s: 2, label: 'Camera' },
            { s: 3, label: 'Printer' },
            { s: 4, label: 'Ready' },
          ].map((item) => (
            <div
              key={item.s}
              className={`py-2.5 font-medium transition-colors border-b-2 ${
                step === item.s
                  ? 'border-primary text-primary bg-primary/5'
                  : step > item.s
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              Step {item.s}: {item.label}
            </div>
          ))}
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 space-y-4 min-h-[260px] flex flex-col justify-center">
          {/* Step 1: Displays */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <Monitor className="w-8 h-8" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Step 1: Configure Dual Displays</h4>
                  <p className="text-xs text-muted-foreground">
                    Assign the operator workspace and the guest-facing screen.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monitor A (Operator):</span>
                  <span className="font-semibold text-foreground">Primary Display</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monitor B (Guest Screen):</span>
                  <select
                    value={selectedGuestMonitorId}
                    onChange={(e) => setSelectedGuestMonitorId(e.target.value)}
                    className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground"
                  >
                    {monitors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={launchGuestDisplay}
                className="w-full py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors border border-border"
              >
                Launch Guest Display on Monitor B
              </button>
            </div>
          )}

          {/* Step 2: Camera */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <Camera className="w-8 h-8" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Step 2: Test Camera Shutter</h4>
                  <p className="text-xs text-muted-foreground">
                    Confirm camera connection and test capture response.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Active Camera Driver
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mock', 'webcam', 'dslr'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setCameraAdapterType(type)}
                      className={`py-2 text-xs rounded-lg font-bold uppercase ${
                        cameraAdapterType === type
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTestShutter}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                {testShotDone ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Camera className="w-4 h-4" />}
                <span>{testShotDone ? 'Camera Verified & Ready!' : 'Trigger Test Shutter'}</span>
              </button>
            </div>
          )}

          {/* Step 3: Printer */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-emerald-400">
                <Printer className="w-8 h-8" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Step 3: Confirm Windows Printer</h4>
                  <p className="text-xs text-muted-foreground">
                    Selected: Epson EcoTank L3250 4x6 Photo Printer.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Default Event Printer
                </label>
                <select
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground font-medium"
                >
                  {printers.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.displayName || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1 text-muted-foreground">
                <span className="font-semibold text-foreground block">Paper Target:</span>
                <span>4 x 6 in (102 x 152 mm) Photo Quality • Borderless</span>
              </div>
            </div>
          )}

          {/* Step 4: Ready */}
          {step === 4 && (
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Booth Pre-Flight Complete!</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Ready for <span className="font-semibold text-foreground">{activeEvent.name}</span>. You can now start guest sessions in Live Booth!
              </p>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-border bg-muted/40 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              <span>Finish & Open Live Booth</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
