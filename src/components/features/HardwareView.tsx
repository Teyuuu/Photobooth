import React, { useState } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import {
  Camera,
  Printer,
  Monitor,
  RefreshCw,
  Play,
  Maximize2,
  FileText,
} from 'lucide-react';

export const HardwareView: React.FC = () => {
  const {
    cameraAdapterType,
    setCameraAdapterType,
    cameraStatus,
    cameraDevices,
    selectedCameraId,
    setSelectedCameraId,
    reconnectCamera,
    testCapture,
    printers,
    selectedPrinter,
    setSelectedPrinter,
    refreshPrinters,
    monitors,
    selectedGuestMonitorId,
    setSelectedGuestMonitorId,
    launchGuestDisplay,
  } = usePhotobooth();

  const [testResultImg, setTestResultImg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [testPrintStatus, setTestPrintStatus] = useState<string | null>(null);

  const handleTestCapture = async () => {
    setIsCapturing(true);
    try {
      const img = await testCapture();
      setTestResultImg(img);
    } catch (err: any) {
      alert(`Capture failed: ${err.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleTestPrint = async () => {
    setTestPrintStatus('Submitting test page to Windows Print Spooler...');
    try {
      // Create a test 4x6 calibration card canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1800, 1200);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1740, 1140);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EPSON L3250 TEST CALIBRATION PRINT', 900, 400);

      ctx.font = '30px monospace';
      ctx.fillText(`PRINTER: ${selectedPrinter}`, 900, 500);
      ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString()}`, 900, 580);
      ctx.fillText('SIZE: 4x6 INCH (102 x 152 MM) • BORDERLESS CALIBRATION', 900, 660);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      if (window.photoboothAPI?.printPhoto) {
        const res = await window.photoboothAPI.printPhoto({
          imageUrl: dataUrl,
          printerName: selectedPrinter,
          copies: 1,
          paperSize: '4x6',
        });
        if (res.success) {
          setTestPrintStatus('Test print submitted successfully to Windows print queue.');
        } else {
          setTestPrintStatus(`Print submission failed: ${res.error}`);
        }
      } else {
        setTestPrintStatus('Browser fallback print triggered.');
        const w = window.open();
        w?.document.write(`<img src="${dataUrl}" onload="window.print();window.close();"/>`);
      }
    } catch (e: any) {
      setTestPrintStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Hardware & Peripherals Setup</h2>
          <p className="text-xs text-muted-foreground">
            Configure camera adapter, Windows print driver (Epson L3250), and dual-monitor displays.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Camera Adapter Module */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">Camera Integration</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                cameraStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {cameraStatus}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Camera Adapter Driver
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mock', 'webcam', 'dslr'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCameraAdapterType(type)}
                    className={`py-2 px-1 text-xs rounded-lg font-semibold uppercase transition-all ${
                      cameraAdapterType === type
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {type === 'mock' ? 'Demo Mock' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Device selection */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Detected Cameras
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground"
              >
                {cameraDevices.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name} {dev.batteryLevel ? `(${dev.batteryLevel}%)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={reconnectCamera}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconnect</span>
              </button>
              <button
                onClick={handleTestCapture}
                disabled={isCapturing}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isCapturing ? 'Snapping...' : 'Test Shot'}</span>
              </button>
            </div>

            {testResultImg && (
              <div className="pt-2">
                <span className="text-[10px] text-muted-foreground block mb-1">Last Test Capture:</span>
                <div className="rounded-lg overflow-hidden border border-border aspect-[3/2] bg-black">
                  <img src={testResultImg} alt="Test Capture" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Printer Module (Epson L3250) */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-2">
              <Printer className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">Windows Printer Driver</span>
            </div>
            <button
              onClick={refreshPrinters}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="Refresh printer list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Active Windows Printer
              </label>
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground"
              >
                {printers.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.displayName || p.name} {p.name.includes('L3250') ? '(Recommended)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Paper Size</label>
                <select className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                  <option value="4x6">4 x 6 in (102x152mm)</option>
                  <option value="2x6">2 x 6 in Strip (51x152mm)</option>
                  <option value="A4">A4 Full Sheet</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Print Quality</label>
                <select className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                  <option value="high">High (Photo Paper)</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleTestPrint}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Send 4x6 Calibration Test Print</span>
              </button>
            </div>

            {testPrintStatus && (
              <div className="p-2 rounded bg-muted/60 text-[11px] text-muted-foreground font-mono">
                {testPrintStatus}
              </div>
            )}
          </div>
        </div>

        {/* 3. Dual Monitor Setup */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-accent" />
              <span className="font-bold text-sm">Dual Display Manager</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              {monitors.length} Detected
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Guest Display Target Monitor
              </label>
              <select
                value={selectedGuestMonitorId}
                onChange={(e) => setSelectedGuestMonitorId(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground"
              >
                {monitors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isPrimary ? '(Operator Primary)' : '(Guest Secondary)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-2 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monitor A (Operator):</span>
                <span className="font-semibold text-foreground">DISPLAY1 (1920x1080)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monitor B (Guest Screen):</span>
                <span className="font-semibold text-foreground">DISPLAY2 (1920x1080)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={launchGuestDisplay}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs transition-colors shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Launch Fullscreen Guest Display</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
