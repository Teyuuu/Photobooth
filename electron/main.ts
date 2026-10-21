import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let operatorWindow: BrowserWindow | null = null;
let guestWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const VITE_DEV_SERVER_URL = 'http://localhost:5173';

function getStorageDirectory(): string {
  const baseDir = path.join(app.getPath('userData'), 'PhotoboothData');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
}

function createOperatorWindow() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  operatorWindow = new BrowserWindow({
    title: 'Photobooth Studio OS - Operator Workspace',
    width: Math.min(1440, primaryDisplay.workAreaSize.width),
    height: Math.min(900, primaryDisplay.workAreaSize.height),
    x: primaryDisplay.bounds.x + 50,
    y: primaryDisplay.bounds.y + 50,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#070a13',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    operatorWindow.loadURL(`${VITE_DEV_SERVER_URL}?mode=operator`);
  } else {
    operatorWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { mode: 'operator' },
    });
  }

  operatorWindow.on('closed', () => {
    operatorWindow = null;
    if (guestWindow) {
      guestWindow.close();
    }
  });
}

function createGuestWindow(targetDisplayId?: number | string) {
  const displays = screen.getAllDisplays();
  let targetDisplay = displays.find((d) => String(d.id) === String(targetDisplayId));

  // If no specific display is requested, prefer the secondary non-primary display
  if (!targetDisplay) {
    targetDisplay = displays.find((d) => d.id !== screen.getPrimaryDisplay().id) || screen.getPrimaryDisplay();
  }

  const isDualMonitor = displays.length > 1 && targetDisplay.id !== screen.getPrimaryDisplay().id;

  guestWindow = new BrowserWindow({
    title: 'Photobooth Guest Screen',
    x: targetDisplay.bounds.x,
    y: targetDisplay.bounds.y,
    width: isDualMonitor ? targetDisplay.bounds.width : 1024,
    height: isDualMonitor ? targetDisplay.bounds.height : 768,
    frame: !isDev && isDualMonitor ? false : true,
    fullscreen: isDualMonitor,
    backgroundColor: '#05070e',
    alwaysOnTop: isDualMonitor,
    skipTaskbar: isDualMonitor,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    guestWindow.loadURL(`${VITE_DEV_SERVER_URL}?mode=guest`);
  } else {
    guestWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { mode: 'guest' },
    });
  }

  guestWindow.on('closed', () => {
    guestWindow = null;
    if (operatorWindow && !operatorWindow.isDestroyed()) {
      operatorWindow.webContents.send('guest-window-status', { isOpen: false });
    }
  });
}

// IPC Handlers
function setupIPC() {
  ipcMain.handle('get-monitors', async () => {
    const primaryId = screen.getPrimaryDisplay().id;
    return screen.getAllDisplays().map((disp, index) => ({
      id: disp.id,
      name: `Display ${index + 1} (${disp.bounds.width}x${disp.bounds.height})${disp.id === primaryId ? ' - Primary' : ' - External'}`,
      bounds: disp.bounds,
      isPrimary: disp.id === primaryId,
      scaleFactor: disp.scaleFactor,
    }));
  });

  ipcMain.handle('set-guest-display', async (_, { monitorId, fullscreen }) => {
    const displays = screen.getAllDisplays();
    const target = displays.find((d) => String(d.id) === String(monitorId));

    if (!target) return false;

    if (guestWindow && !guestWindow.isDestroyed()) {
      guestWindow.setBounds(target.bounds);
      if (fullscreen) {
        guestWindow.setFullScreen(true);
      }
    } else {
      createGuestWindow(target.id);
    }
    return true;
  });

  ipcMain.handle('get-printers', async () => {
    if (!operatorWindow) return [];
    try {
      const printers = await operatorWindow.webContents.getPrintersAsync();
      return printers.map((p) => ({
        name: p.name,
        displayName: p.displayName || p.name,
        status: p.status === 0 ? 'online' : 'busy',
        isDefault: p.isDefault,
        driverName: (p.options as Record<string, any>)?.[`driver-name`] || '',
        portName: (p.options as Record<string, any>)?.[`port-name`] || '',
      }));
    } catch (err) {
      console.error('Failed to get printers:', err);
      return [];
    }
  });

  ipcMain.handle('print-photo', async (_, { imageUrl, printerName, copies }) => {
    try {
      // Create hidden print window
      const printWin = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true },
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @page { size: 4in 6in; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
            img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" />
        </body>
        </html>
      `;

      await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      return new Promise((resolve) => {
        printWin.webContents.print(
          {
            silent: false, // will prompt or use device settings
            deviceName: printerName || undefined,
            copies: copies || 1,
            margins: { marginType: 'none' },
            pageSize: { width: 101600, height: 152400 }, // 4x6 in microns (101.6mm x 152.4mm)
          },
          (success, failureReason) => {
            printWin.close();
            if (success) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: failureReason });
            }
          }
        );
      });
    } catch (err: any) {
      return { success: false, error: err.message || 'Print execution failed' };
    }
  });

  ipcMain.handle('save-session-data', async (_, session) => {
    try {
      const storageDir = getStorageDirectory();
      const eventDir = path.join(storageDir, 'events', session.eventId || 'default-event');
      const sessionDir = path.join(eventDir, 'sessions', session.id);

      fs.mkdirSync(sessionDir, { recursive: true });

      // Save metadata JSON
      const metaPath = path.join(sessionDir, 'session.json');
      fs.writeFileSync(metaPath, JSON.stringify(session, null, 2), 'utf-8');

      // Save photos
      if (session.photos && Array.isArray(session.photos)) {
        for (let i = 0; i < session.photos.length; i++) {
          const photo = session.photos[i];
          if (photo.originalDataUrl && photo.originalDataUrl.startsWith('data:image/')) {
            const base64Data = photo.originalDataUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filePath = path.join(sessionDir, `photo_${photo.sequenceNumber || i + 1}.jpg`);
            fs.writeFileSync(filePath, buffer);
          }
        }
      }

      // Save composed print image if present
      if (session.deliverables?.composedImageUrl?.startsWith('data:image/')) {
        const base64Data = session.deliverables.composedImageUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filePath = path.join(sessionDir, 'composition.jpg');
        fs.writeFileSync(filePath, buffer);
      }

      return { success: true, savedPath: sessionDir };
    } catch (err: any) {
      console.error('Failed to save session:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-storage-info', async () => {
    const storageDir = getStorageDirectory();
    return {
      appDataPath: storageDir,
      totalSessions: 0,
      totalPhotos: 0,
      diskUsedMb: 12.4,
      diskFreeMb: Math.round(os.freemem() / (1024 * 1024)),
    };
  });

  ipcMain.handle('get-diagnostics', async () => {
    const displays = screen.getAllDisplays();
    const primaryId = screen.getPrimaryDisplay().id;
    return {
      appVersion: '1.0.0',
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      platform: process.platform,
      osRelease: os.release(),
      monitors: displays.map((disp, i) => ({
        id: disp.id,
        name: `Display ${i + 1} (${disp.bounds.width}x${disp.bounds.height})`,
        bounds: disp.bounds,
        isPrimary: disp.id === primaryId,
        scaleFactor: disp.scaleFactor,
      })),
      printers: [],
      activeCamera: 'Integrated / Mock Adapter',
      activePrinter: 'EPSON L3250 Series',
      storage: {
        appDataPath: getStorageDirectory(),
        totalSessions: 0,
        totalPhotos: 0,
        diskUsedMb: 12,
        diskFreeMb: Math.round(os.freemem() / (1024 * 1024)),
      },
    };
  });

  // Cross-window Session Sync Bridge
  ipcMain.on('sync-session-to-guest', (_, sessionData) => {
    if (guestWindow && !guestWindow.isDestroyed()) {
      guestWindow.webContents.send('session-update-from-operator', sessionData);
    }
  });

  ipcMain.handle('open-external-url', async (_, url) => {
    await shell.openExternal(url);
  });
}

app.whenReady().then(() => {
  setupIPC();
  createOperatorWindow();
  createGuestWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOperatorWindow();
      createGuestWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
