const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  // Security
  getSecureKey: () => ipcRenderer.invoke('get-secure-key'),
  onBlur: (callback) => ipcRenderer.on('app-blur', (_, val) => callback(val)),
  // Navigation
  goBack: () => ipcRenderer.send('go-back'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  // Window controls (frameless Win/Linux)
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  isMac: () => ipcRenderer.invoke('get-is-mac'),
});
