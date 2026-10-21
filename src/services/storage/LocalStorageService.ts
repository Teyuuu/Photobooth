import { EventConfig, Template, Session } from '@/types';

const STORAGE_KEYS = {
  EVENTS: 'photobooth_events_v1',
  ACTIVE_EVENT_ID: 'photobooth_active_event_id_v1',
  TEMPLATES: 'photobooth_templates_v1',
  SESSIONS: 'photobooth_sessions_v1',
  SETTINGS: 'photobooth_app_settings_v1',
};

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-classic-4x6-3shot',
    name: 'Classic 4x6 Vertical (3-Shot Studio)',
    widthMm: 102,
    heightMm: 152,
    orientation: 'portrait',
    dpi: 300,
    backgroundColor: '#ffffff',
    safeMarginMm: 4,
    elements: [
      {
        id: 'photo-1',
        type: 'photo',
        photoIndex: 0,
        x: 6,
        y: 6,
        width: 90,
        height: 38,
        zIndex: 1,
        borderRadius: 2,
        borderColor: '#e2e8f0',
        borderWidth: 0.5,
      },
      {
        id: 'photo-2',
        type: 'photo',
        photoIndex: 1,
        x: 6,
        y: 47,
        width: 90,
        height: 38,
        zIndex: 1,
        borderRadius: 2,
        borderColor: '#e2e8f0',
        borderWidth: 0.5,
      },
      {
        id: 'photo-3',
        type: 'photo',
        photoIndex: 2,
        x: 6,
        y: 88,
        width: 90,
        height: 38,
        zIndex: 1,
        borderRadius: 2,
        borderColor: '#e2e8f0',
        borderWidth: 0.5,
      },
      {
        id: 'footer-text-1',
        type: 'text',
        text: 'PHOTOBOOTH MEMORIES',
        x: 6,
        y: 130,
        width: 90,
        height: 8,
        fontSize: 3.5,
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'center',
        zIndex: 2,
      },
      {
        id: 'footer-text-2',
        type: 'text',
        text: 'Captured with Photobooth Studio OS',
        x: 6,
        y: 138,
        width: 90,
        height: 6,
        fontSize: 2.4,
        fontWeight: '400',
        color: '#64748b',
        textAlign: 'center',
        zIndex: 2,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-grid-4x6-4shot',
    name: 'Modern 2x2 Grid (4-Shot Square)',
    widthMm: 102,
    heightMm: 152,
    orientation: 'portrait',
    dpi: 300,
    backgroundColor: '#0a0d17',
    safeMarginMm: 4,
    elements: [
      {
        id: 'photo-1',
        type: 'photo',
        photoIndex: 0,
        x: 6,
        y: 8,
        width: 43,
        height: 52,
        zIndex: 1,
        borderRadius: 2,
      },
      {
        id: 'photo-2',
        type: 'photo',
        photoIndex: 1,
        x: 53,
        y: 8,
        width: 43,
        height: 52,
        zIndex: 1,
        borderRadius: 2,
      },
      {
        id: 'photo-3',
        type: 'photo',
        photoIndex: 2,
        x: 6,
        y: 64,
        width: 43,
        height: 52,
        zIndex: 1,
        borderRadius: 2,
      },
      {
        id: 'photo-4',
        type: 'photo',
        photoIndex: 3,
        x: 53,
        y: 64,
        width: 43,
        height: 52,
        zIndex: 1,
        borderRadius: 2,
      },
      {
        id: 'title-text',
        type: 'text',
        text: 'CELEBRATION NIGHT',
        x: 6,
        y: 124,
        width: 90,
        height: 10,
        fontSize: 4,
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        zIndex: 2,
      },
      {
        id: 'date-text',
        type: 'text',
        text: new Date().toLocaleDateString(undefined, { dateStyle: 'long' }),
        x: 6,
        y: 135,
        width: 90,
        height: 6,
        fontSize: 2.5,
        fontWeight: '500',
        color: '#94a3b8',
        textAlign: 'center',
        zIndex: 2,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-strip-2x6',
    name: 'Classic 2x6 Strip (3-Shot Cutout)',
    widthMm: 51,
    heightMm: 152,
    orientation: 'portrait',
    dpi: 300,
    backgroundColor: '#ffffff',
    safeMarginMm: 3,
    elements: [
      {
        id: 'photo-1',
        type: 'photo',
        photoIndex: 0,
        x: 4,
        y: 6,
        width: 43,
        height: 38,
        zIndex: 1,
      },
      {
        id: 'photo-2',
        type: 'photo',
        photoIndex: 1,
        x: 4,
        y: 47,
        width: 43,
        height: 38,
        zIndex: 1,
      },
      {
        id: 'photo-3',
        type: 'photo',
        photoIndex: 2,
        x: 4,
        y: 88,
        width: 43,
        height: 38,
        zIndex: 1,
      },
      {
        id: 'strip-footer',
        type: 'text',
        text: 'SMILE & SHARE',
        x: 4,
        y: 134,
        width: 43,
        height: 8,
        fontSize: 3,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        zIndex: 2,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_EVENT: EventConfig = {
  id: 'event-live-default',
  name: 'Grand Gala Photobooth 2026',
  description: 'Official photobooth station for tonight event',
  eventDate: new Date().toISOString().split('T')[0],
  status: 'active',
  branding: {
    eventName: 'Grand Gala 2026',
    subtitle: 'Strike a Pose & Make a Memory',
    welcomeMessage: 'Touch or Press Start to Begin!',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    privacyNotice: 'Photos are stored securely and accessible only via your private QR code.',
  },
  captureSettings: {
    shotsCount: 3,
    countdownSec: 3,
    shotIntervalSec: 2,
    previewSec: 4,
    maxRetakes: 1,
    retakeMode: 'individual',
    mirrorPreview: true,
    flashEffect: true,
    captureSound: true,
    autoStart: false,
    sessionCompletionDelaySec: 15,
    printOnComplete: false,
  },
  printSettings: {
    printerName: 'EPSON83442C (L3250 Series)',
    paperSize: '4x6',
    orientation: 'portrait',
    copies: 1,
    quality: 'high',
    borderless: true,
    cutGuide: false,
    autoPrint: false,
  },
  gallerySettings: {
    cloudEnabled: false,
    localFallbackEnabled: true,
    qrDurationSec: 15,
    qrBaseUrl: 'https://gallery.photobooth-cloud.com/session/',
    expirationHours: 48,
  },
  gifSettings: {
    enabled: true,
    frameDelayMs: 650,
    width: 600,
    height: 400,
    includeBranding: true,
  },
  defaultTemplateId: 'tpl-classic-4x6-3shot',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class LocalStorageService {
  static getEvents(): EventConfig[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      const initial = [DEFAULT_EVENT];
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [DEFAULT_EVENT];
    }
  }

  static saveEvents(events: EventConfig[]) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  static getActiveEvent(): EventConfig {
    const events = this.getEvents();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
    const found = events.find((e) => e.id === activeId);
    return found || events[0] || DEFAULT_EVENT;
  }

  static setActiveEventId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  }

  static getTemplates(): Template[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TEMPLATES;
    }
  }

  static saveTemplates(templates: Template[]) {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }

  static getSessions(): Session[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveSession(session: Session) {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    // Keep max 100 recent sessions in localStorage to prevent quota exhaustion
    const trimmed = sessions.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmed));

    // Also persist through Electron IPC if running in desktop environment
    if (window.photoboothAPI?.saveSessionData) {
      window.photoboothAPI.saveSessionData(session).catch((err) => {
        console.warn('Could not persist session via Electron:', err);
      });
    }
  }

  static getAppSettings(): { theme: 'dark' | 'light'; simplifiedMode: boolean } {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { theme: 'dark', simplifiedMode: false };
    try {
      return JSON.parse(raw);
    } catch {
      return { theme: 'dark', simplifiedMode: false };
    }
  }

  static saveAppSettings(settings: { theme: 'dark' | 'light'; simplifiedMode: boolean }) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
}
