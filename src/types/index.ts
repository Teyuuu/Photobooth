// Core Data Models & Types for Photobooth Studio OS

export type SessionState =
  | 'idle'
  | 'preparing'
  | 'countdown'
  | 'capturing'
  | 'reviewing'
  | 'processing'
  | 'printing'
  | 'delivering'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface CameraDevice {
  id: string;
  name: string;
  type: 'mock' | 'webcam' | 'dslr';
  status: 'connected' | 'disconnected' | 'busy' | 'error';
  driverInfo?: string;
  batteryLevel?: number; // 0 - 100 if supported
}

export interface CameraAdapter {
  id: string;
  name: string;
  type: 'mock' | 'webcam' | 'dslr';
  discover(): Promise<CameraDevice[]>;
  connect(deviceId: string): Promise<boolean>;
  disconnect(): Promise<void>;
  capture(): Promise<string>; // returns base64 or file URL of captured image
  getStatus(): CameraDevice['status'];
  isLiveFeedSupported(): boolean;
}

export interface PrinterDevice {
  name: string;
  displayName: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  isDefault: boolean;
  driverName?: string;
  portName?: string;
}

export interface MonitorDisplay {
  id: number | string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  isPrimary: boolean;
  scaleFactor: number;
}

export interface CaptureSettings {
  shotsCount: number; // e.g. 3, 4, 6
  countdownSec: number; // e.g. 3, 5
  shotIntervalSec: number; // pause between shots e.g. 2s
  previewSec: number; // review duration
  maxRetakes: number; // 0 = no retakes, 1, 2, or unlimited
  retakeMode: 'individual' | 'restart_all';
  mirrorPreview: boolean;
  flashEffect: boolean;
  captureSound: boolean;
  autoStart: boolean;
  sessionCompletionDelaySec: number; // return to idle after 15s
  printOnComplete: boolean;
}

export interface PrintSettings {
  printerName: string;
  paperSize: '4x6' | 'strip_2x6' | 'A4' | 'custom';
  orientation: 'portrait' | 'landscape';
  copies: number;
  quality: 'draft' | 'normal' | 'high';
  borderless: boolean;
  cutGuide: boolean;
  autoPrint: boolean;
}

export interface GallerySettings {
  cloudEnabled: boolean;
  localFallbackEnabled: boolean;
  qrDurationSec: number;
  qrBaseUrl: string;
  expirationHours: number;
}

export interface GifSettings {
  enabled: boolean;
  frameDelayMs: number;
  width: number;
  height: number;
  includeBranding: boolean;
}

export interface BrandingConfig {
  logoUrl?: string;
  eventName: string;
  subtitle?: string;
  primaryColor?: string;
  accentColor?: string;
  welcomeMessage?: string;
  privacyNotice?: string;
}

export interface EventConfig {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
  status: 'active' | 'archived';
  branding: BrandingConfig;
  captureSettings: CaptureSettings;
  printSettings: PrintSettings;
  gallerySettings: GallerySettings;
  gifSettings: GifSettings;
  defaultTemplateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateElement {
  id: string;
  type: 'photo' | 'text' | 'image' | 'shape' | 'qr';
  x: number; // in mm or percentage/canvas units
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  isLocked?: boolean;
  // Specific properties
  photoIndex?: number; // 0, 1, 2... for photo placeholders
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  src?: string; // for image/logo/decorative
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface Template {
  id: string;
  name: string;
  widthMm: number; // e.g. 102 for 4 inches
  heightMm: number; // e.g. 152 for 6 inches
  orientation: 'portrait' | 'landscape';
  dpi: number; // default 300 dpi
  backgroundColor: string;
  backgroundImageUrl?: string;
  safeMarginMm: number;
  elements: TemplateElement[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPhoto {
  id: string;
  sessionId: string;
  sequenceNumber: number;
  originalDataUrl: string;
  thumbnailDataUrl?: string;
  capturedAt: string;
}

export interface SessionDeliverables {
  composedImageUrl?: string;
  gifUrl?: string;
  qrCodeUrl?: string;
  galleryUrl?: string;
  galleryToken?: string;
}

export interface Session {
  id: string;
  eventId: string;
  status: SessionState;
  startedAt: string;
  completedAt?: string;
  photos: SessionPhoto[];
  deliverables: SessionDeliverables;
  printStatus: 'none' | 'pending' | 'submitted' | 'completed' | 'failed';
  syncStatus: 'none' | 'pending' | 'syncing' | 'synced' | 'failed';
  retakesUsed: number;
  errorMessage?: string;
}

export interface PrintJob {
  id: string;
  sessionId: string;
  printerName: string;
  copies: number;
  paperSize: string;
  status: 'pending' | 'submitted' | 'completed' | 'failed';
  submittedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface StorageInfo {
  appDataPath: string;
  totalSessions: number;
  totalPhotos: number;
  diskUsedMb: number;
  diskFreeMb: number;
}

export interface DiagnosticInfo {
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  platform: string;
  osRelease: string;
  monitors: MonitorDisplay[];
  printers: PrinterDevice[];
  activeCamera: string;
  activePrinter: string;
  storage: StorageInfo;
}

// Window Bridge / Electron API interface
export interface IPhotoboothAPI {
  getMonitors(): Promise<MonitorDisplay[]>;
  setGuestDisplay(monitorId: number | string, fullscreen: boolean): Promise<boolean>;
  getPrinters(): Promise<PrinterDevice[]>;
  printPhoto(printJob: { imageUrl: string; printerName: string; copies: number; paperSize: string }): Promise<{ success: boolean; error?: string }>;
  saveSessionData(session: Session): Promise<{ success: boolean; savedPath?: string }>;
  getStorageInfo(): Promise<StorageInfo>;
  getDiagnostics(): Promise<DiagnosticInfo>;
  onGuestSessionUpdate(callback: (session: Partial<Session>) => void): () => void;
  sendSessionUpdateToGuest(session: Partial<Session>): void;
  openExternalUrl(url: string): Promise<void>;
  isElectron: boolean;
}

declare global {
  interface Window {
    photoboothAPI?: IPhotoboothAPI;
  }
}
