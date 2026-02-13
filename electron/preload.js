const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  goBack: () => ipcRenderer.send('go-back'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
});
