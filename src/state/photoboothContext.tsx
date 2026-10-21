import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  EventConfig,
  Template,
  Session,
  SessionState,
  SessionPhoto,
  CameraDevice,
  PrinterDevice,
  MonitorDisplay,
} from '@/types';
import { LocalStorageService } from '@/services/storage/LocalStorageService';
import { MockCameraAdapter } from '@/services/hardware/MockCameraAdapter';
import { WebcamAdapter } from '@/services/hardware/WebcamAdapter';
import { DslrCameraAdapter } from '@/services/hardware/DslrAdapter';
import { CompositionService } from '@/services/processing/CompositionService';
import { GifService } from '@/services/processing/GifService';
import { QrService } from '@/services/gallery/QrService';

interface PhotoboothContextType {
  // Event & Templates
  activeEvent: EventConfig;
  setActiveEvent: (event: EventConfig) => void;
  templates: Template[];
  activeTemplate: Template;
  setActiveTemplate: (template: Template) => void;
  saveTemplate: (template: Template) => void;

  // Hardware State
  cameraAdapterType: 'mock' | 'webcam' | 'dslr';
  setCameraAdapterType: (type: 'mock' | 'webcam' | 'dslr') => void;
  cameraStatus: CameraDevice['status'];
  cameraDevices: CameraDevice[];
  selectedCameraId: string;
  setSelectedCameraId: (id: string) => void;
  reconnectCamera: () => Promise<void>;
  testCapture: () => Promise<string>;

  // Printers
  printers: PrinterDevice[];
  selectedPrinter: string;
  setSelectedPrinter: (name: string) => void;
  refreshPrinters: () => Promise<void>;
  printSession: (copies?: number) => Promise<{ success: boolean; error?: string }>;

  // Displays
  monitors: MonitorDisplay[];
  selectedGuestMonitorId: number | string;
  setSelectedGuestMonitorId: (id: number | string) => void;
  isGuestWindowOpen: boolean;
  launchGuestDisplay: () => Promise<void>;

  // Session State Machine
  sessionState: SessionState;
  countdownRemaining: number;
  currentShotIndex: number;
  currentSession: Session | null;
  recentSessions: Session[];
  startSession: () => void;
  cancelSession: () => void;
  retakeShot: (photoIndex: number) => void;
  finishSession: () => Promise<void>;
  resetToIdle: () => void;

  // Flash & Audio Effects
  isFlashing: boolean;

  // App UI Mode
  simplifiedMode: boolean;
  setSimplifiedMode: (enabled: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const PhotoboothContext = createContext<PhotoboothContextType | null>(null);

// BroadcastChannel for cross-window sync in browser / dev mode
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('photobooth_dual_screen_sync')
  : null;

export const PhotoboothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App Config
  const [activeEvent, setActiveEventState] = useState<EventConfig>(LocalStorageService.getActiveEvent());
  const [templates, setTemplates] = useState<Template[]>(LocalStorageService.getTemplates());
  const [activeTemplate, setActiveTemplateState] = useState<Template>(() => {
    const list = LocalStorageService.getTemplates();
    return list.find((t) => t.id === activeEvent.defaultTemplateId) || list[0];
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(LocalStorageService.getAppSettings().theme);
  const [simplifiedMode, setSimplifiedModeState] = useState<boolean>(LocalStorageService.getAppSettings().simplifiedMode);

  // Hardware Adapters
  const [cameraAdapterType, setCameraAdapterTypeState] = useState<'mock' | 'webcam' | 'dslr'>('mock');
  const [cameraStatus, setCameraStatus] = useState<CameraDevice['status']>('connected');
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const mockAdapterRef = useRef(new MockCameraAdapter());
  const webcamAdapterRef = useRef(new WebcamAdapter());
  const dslrAdapterRef = useRef(new DslrCameraAdapter());

  const getActiveAdapter = useCallback(() => {
    if (cameraAdapterType === 'webcam') return webcamAdapterRef.current;
    if (cameraAdapterType === 'dslr') return dslrAdapterRef.current;
    return mockAdapterRef.current;
  }, [cameraAdapterType]);

  // Printers
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>(activeEvent.printSettings.printerName || 'EPSON83442C (L3250 Series)');

  // Monitors
  const [monitors, setMonitors] = useState<MonitorDisplay[]>([]);
  const [selectedGuestMonitorId, setSelectedGuestMonitorId] = useState<number | string>('');
  const [isGuestWindowOpen, setIsGuestWindowOpen] = useState(true);

  // Session State
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>(LocalStorageService.getSessions());
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Timers
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize state with Guest Window
  const broadcastToGuest = useCallback(
    (customPayload?: any) => {
      const payload = customPayload || {
        sessionState,
        countdownRemaining,
        currentShotIndex,
        currentSession,
        activeEvent: {
          branding: activeEvent.branding,
          captureSettings: activeEvent.captureSettings,
        },
        activeTemplate,
        isFlashing,
      };

      // Native Electron IPC
      if (window.photoboothAPI?.sendSessionUpdateToGuest) {
        window.photoboothAPI.sendSessionUpdateToGuest(payload);
      }

      // BroadcastChannel Fallback (Dev / Web preview)
      syncChannel?.postMessage(payload);
    },
    [sessionState, countdownRemaining, currentShotIndex, currentSession, activeEvent, activeTemplate, isFlashing]
  );

  useEffect(() => {
    broadcastToGuest();
  }, [sessionState, countdownRemaining, currentShotIndex, currentSession, isFlashing, broadcastToGuest]);

  // Initial Hardware Discovery
  useEffect(() => {
    const initHardware = async () => {
      // 1. Discover Cameras
      try {
        const adapter = getActiveAdapter();
        const devs = await adapter.discover();
        setCameraDevices(devs);
        if (devs.length > 0 && !selectedCameraId) {
          setSelectedCameraId(devs[0].id);
        }
        setCameraStatus(adapter.getStatus());
      } catch (err) {
        console.warn('Camera discovery failed:', err);
      }

      // 2. Discover Printers
      if (window.photoboothAPI?.getPrinters) {
        try {
          const detected = await window.photoboothAPI.getPrinters();
          setPrinters(detected);
          // If Epson L3250 is found, select it by default
          const epson = detected.find((p) => p.name.includes('L3250') || p.displayName.includes('L3250'));
          if (epson) {
            setSelectedPrinter(epson.name);
          } else if (detected.length > 0) {
            setSelectedPrinter(detected[0].name);
          }
        } catch (err) {
          console.warn('Printer discovery failed:', err);
        }
      } else {
        // Fallback printers in dev mode
        setPrinters([
          { name: 'EPSON83442C (L3250 Series)', displayName: 'EPSON L3250 Series (Color Inkjet)', status: 'online', isDefault: true },
          { name: 'Microsoft Print to PDF', displayName: 'Microsoft Print to PDF', status: 'online', isDefault: false },
        ]);
      }

      // 3. Discover Displays
      if (window.photoboothAPI?.getMonitors) {
        try {
          const mons = await window.photoboothAPI.getMonitors();
          setMonitors(mons);
          const external = mons.find((m) => !m.isPrimary);
          if (external) {
            setSelectedGuestMonitorId(external.id);
          } else if (mons.length > 0) {
            setSelectedGuestMonitorId(mons[0].id);
          }
        } catch (err) {
          console.warn('Monitor discovery failed:', err);
        }
      }
    };

    initHardware();
  }, [cameraAdapterType, getActiveAdapter, selectedCameraId]);

  const setCameraAdapterType = (type: 'mock' | 'webcam' | 'dslr') => {
    setCameraAdapterTypeState(type);
    const adapter = type === 'webcam' ? webcamAdapterRef.current : type === 'dslr' ? dslrAdapterRef.current : mockAdapterRef.current;
    adapter.discover().then((devs) => {
      setCameraDevices(devs);
      if (devs.length > 0) setSelectedCameraId(devs[0].id);
      setCameraStatus(adapter.getStatus());
    });
  };

  const reconnectCamera = async () => {
    const adapter = getActiveAdapter();
    setCameraStatus('busy');
    const ok = await adapter.connect(selectedCameraId);
    setCameraStatus(ok ? 'connected' : 'error');
  };

  const testCapture = async (): Promise<string> => {
    const adapter = getActiveAdapter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);
    return await adapter.capture();
  };

  const refreshPrinters = async () => {
    if (window.photoboothAPI?.getPrinters) {
      const list = await window.photoboothAPI.getPrinters();
      setPrinters(list);
    }
  };

  const launchGuestDisplay = async () => {
    if (window.photoboothAPI?.setGuestDisplay) {
      const ok = await window.photoboothAPI.setGuestDisplay(selectedGuestMonitorId, true);
      setIsGuestWindowOpen(ok);
    } else {
      // Dev mode: open popup or simulated tab
      window.open('?mode=guest', '_blank', 'width=1024,height=768');
      setIsGuestWindowOpen(true);
    }
  };

  // State Machine Transitions
  const resetToIdle = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
    setSessionState('idle');
    setCountdownRemaining(0);
    setCurrentShotIndex(0);
    setCurrentSession(null);
  };

  const cancelSession = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
    if (currentSession) {
      const cancelled: Session = { ...currentSession, status: 'cancelled' };
      LocalStorageService.saveSession(cancelled);
    }
    resetToIdle();
  };

  const startSession = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);

    const newSession: Session = {
      id: `ses-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: activeEvent.id,
      status: 'preparing',
      startedAt: new Date().toISOString(),
      photos: [],
      deliverables: {},
      printStatus: 'none',
      syncStatus: 'none',
      retakesUsed: 0,
    };

    setCurrentSession(newSession);
    setCurrentShotIndex(0);
    setSessionState('preparing');

    // Begin countdown for shot 1
    setTimeout(() => {
      runShotSequence(0, newSession);
    }, 1200);
  };

  const runShotSequence = (shotIndex: number, session: Session) => {
    setCurrentShotIndex(shotIndex);
    setSessionState('countdown');
    const initialCountdown = activeEvent.captureSettings.countdownSec || 3;
    setCountdownRemaining(initialCountdown);

    let count = initialCountdown;
    countdownTimerRef.current = setInterval(async () => {
      count -= 1;
      setCountdownRemaining(count);

      if (count <= 0) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        await performCapture(shotIndex, session);
      }
    }, 1000);
  };

  const performCapture = async (shotIndex: number, session: Session) => {
    setSessionState('capturing');
    if (activeEvent.captureSettings.flashEffect) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 450);
    }

    try {
      const adapter = getActiveAdapter();
      const photoDataUrl = await adapter.capture();

      const newPhoto: SessionPhoto = {
        id: `photo-${Date.now()}-${shotIndex + 1}`,
        sessionId: session.id,
        sequenceNumber: shotIndex + 1,
        originalDataUrl: photoDataUrl,
        capturedAt: new Date().toISOString(),
      };

      const updatedPhotos = [...session.photos, newPhoto];
      const updatedSession: Session = {
        ...session,
        photos: updatedPhotos,
      };
      setCurrentSession(updatedSession);

      const targetShots = activeEvent.captureSettings.shotsCount || 3;

      if (updatedPhotos.length < targetShots) {
        // Pause between shots
        setSessionState('reviewing');
        setTimeout(() => {
          runShotSequence(shotIndex + 1, updatedSession);
        }, (activeEvent.captureSettings.shotIntervalSec || 2) * 1000);
      } else {
        // All shots captured, finalize session
        await processAndDeliverSession(updatedSession);
      }
    } catch (err: any) {
      console.error('Capture failed:', err);
      setSessionState('error');
      if (currentSession) {
        setCurrentSession({ ...currentSession, status: 'error', errorMessage: err.message });
      }
    }
  };

  const retakeShot = (photoIndex: number) => {
    if (!currentSession) return;
    if (currentSession.retakesUsed >= (activeEvent.captureSettings.maxRetakes || 1)) {
      alert('Maximum retakes reached for this session.');
      return;
    }

    if (activeEvent.captureSettings.retakeMode === 'restart_all') {
      const resetSession: Session = {
        ...currentSession,
        photos: [],
        retakesUsed: currentSession.retakesUsed + 1,
      };
      setCurrentSession(resetSession);
      runShotSequence(0, resetSession);
    } else {
      // Individual retake
      const filtered = currentSession.photos.filter((_, idx) => idx !== photoIndex);
      const updatedSession: Session = {
        ...currentSession,
        photos: filtered,
        retakesUsed: currentSession.retakesUsed + 1,
      };
      setCurrentSession(updatedSession);
      runShotSequence(photoIndex, updatedSession);
    }
  };

  const processAndDeliverSession = async (session: Session) => {
    setSessionState('processing');

    try {
      // 1. Compose High-Resolution Print Image
      const composedImageUrl = await CompositionService.renderComposition(activeTemplate, session.photos);

      // 2. Generate Animated GIF if enabled
      let gifUrl: string | undefined;
      if (activeEvent.gifSettings.enabled) {
        try {
          gifUrl = await GifService.generateGif(
            session.photos,
            activeEvent.gifSettings,
            activeEvent.branding.eventName
          );
        } catch (gifErr) {
          console.warn('GIF creation failed, continuing without GIF:', gifErr);
        }
      }

      // 3. Generate QR Code & Gallery URL
      const galleryToken = QrService.generateGalleryToken();
      const galleryUrl = `${activeEvent.gallerySettings.qrBaseUrl}${galleryToken}`;
      const qrCodeUrl = await QrService.generateQrCodeDataUrl(galleryUrl);

      const completedSession: Session = {
        ...session,
        status: 'delivering',
        completedAt: new Date().toISOString(),
        deliverables: {
          composedImageUrl,
          gifUrl,
          qrCodeUrl,
          galleryUrl,
          galleryToken,
        },
      };

      setCurrentSession(completedSession);
      setSessionState('delivering');

      // Persist session
      LocalStorageService.saveSession(completedSession);
      setRecentSessions(LocalStorageService.getSessions());

      // Auto Print if configured
      if (activeEvent.printSettings.autoPrint || activeEvent.captureSettings.printOnComplete) {
        printSession();
      }

      // Auto Reset Timer back to Idle
      const delay = (activeEvent.captureSettings.sessionCompletionDelaySec || 15) * 1000;
      autoResetTimerRef.current = setTimeout(() => {
        resetToIdle();
      }, delay);
    } catch (err: any) {
      console.error('Session processing failed:', err);
      setSessionState('error');
    }
  };

  const finishSession = async () => {
    if (currentSession && currentSession.photos.length > 0) {
      await processAndDeliverSession(currentSession);
    } else {
      resetToIdle();
    }
  };

  const printSession = async (copies = 1): Promise<{ success: boolean; error?: string }> => {
    if (!currentSession?.deliverables.composedImageUrl) {
      return { success: false, error: 'No composed print image available' };
    }

    setSessionState('printing');

    if (window.photoboothAPI?.printPhoto) {
      const result = await window.photoboothAPI.printPhoto({
        imageUrl: currentSession.deliverables.composedImageUrl,
        printerName: selectedPrinter,
        copies: copies || activeEvent.printSettings.copies || 1,
        paperSize: activeEvent.printSettings.paperSize || '4x6',
      });

      const updatedSession: Session = {
        ...currentSession,
        printStatus: result.success ? 'completed' : 'failed',
      };
      setCurrentSession(updatedSession);
      LocalStorageService.saveSession(updatedSession);
      setSessionState('delivering');
      return result;
    } else {
      // Browser print fallback
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print Photo</title><style>@page { size: 4in 6in; margin: 0; } body { margin:0; }</style></head>
            <body><img src="${currentSession.deliverables.composedImageUrl}" style="width:100%;height:100%;object-fit:contain;" onload="window.print();window.close();"/></body>
          </html>
        `);
      }
      setSessionState('delivering');
      return { success: true };
    }
  };

  const setActiveEvent = (event: EventConfig) => {
    setActiveEventState(event);
    LocalStorageService.setActiveEventId(event.id);
  };

  const setActiveTemplate = (tmpl: Template) => {
    setActiveTemplateState(tmpl);
  };

  const saveTemplate = (tmpl: Template) => {
    const list = templates.map((t) => (t.id === tmpl.id ? tmpl : t));
    if (!list.some((t) => t.id === tmpl.id)) {
      list.push(tmpl);
    }
    setTemplates(list);
    LocalStorageService.saveTemplates(list);
    if (activeTemplate.id === tmpl.id) {
      setActiveTemplateState(tmpl);
    }
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    LocalStorageService.saveAppSettings({ theme: newTheme, simplifiedMode });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const setSimplifiedMode = (enabled: boolean) => {
    setSimplifiedModeState(enabled);
    LocalStorageService.saveAppSettings({ theme, simplifiedMode: enabled });
  };

  // Keep document classes aligned
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <PhotoboothContext.Provider
      value={{
        activeEvent,
        setActiveEvent,
        templates,
        activeTemplate,
        setActiveTemplate,
        saveTemplate,
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
        printSession,
        monitors,
        selectedGuestMonitorId,
        setSelectedGuestMonitorId,
        isGuestWindowOpen,
        launchGuestDisplay,
        sessionState,
        countdownRemaining,
        currentShotIndex,
        currentSession,
        recentSessions,
        startSession,
        cancelSession,
        retakeShot,
        finishSession,
        resetToIdle,
        isFlashing,
        simplifiedMode,
        setSimplifiedMode,
        theme,
        setTheme,
      }}
    >
      {children}
    </PhotoboothContext.Provider>
  );
};

export const usePhotobooth = () => {
  const context = useContext(PhotoboothContext);
  if (!context) {
    throw new Error('usePhotobooth must be used within a PhotoboothProvider');
  }
  return context;
};
