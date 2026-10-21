import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('photoboothAPI', {
  getMonitors: () => ipcRenderer.invoke('get-monitors'),
  setGuestDisplay: (monitorId: number | string, fullscreen: boolean) =>
    ipcRenderer.invoke('set-guest-display', { monitorId, fullscreen }),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printPhoto: (job: { imageUrl: string; printerName: string; copies: number; paperSize: string }) =>
    ipcRenderer.invoke('print-photo', job),
  saveSessionData: (session: any) => ipcRenderer.invoke('save-session-data', session),
  getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
  getDiagnostics: () => ipcRenderer.invoke('get-diagnostics'),
  openExternalUrl: (url: string) => ipcRenderer.invoke('open-external-url', url),

  // Session sync from operator to guest
  sendSessionUpdateToGuest: (sessionData: any) => {
    ipcRenderer.send('sync-session-to-guest', sessionData);
  },

  // Session sync listener on guest window
  onGuestSessionUpdate: (callback: (session: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('session-update-from-operator', subscription);
    return () => {
      ipcRenderer.removeListener('session-update-from-operator', subscription);
    };
  },

  isElectron: true,
});
