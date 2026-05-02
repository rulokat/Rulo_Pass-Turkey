const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  startDpi: (profile) => ipcRenderer.invoke('start-dpi', profile),
  stopDpi: () => ipcRenderer.invoke('stop-dpi'),
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  onLog: (callback) => {
    ipcRenderer.removeAllListeners('dpi-log');
    ipcRenderer.on('dpi-log', (_event, value) => callback(value));
  },
  onStatusChange: (callback) => {
    ipcRenderer.removeAllListeners('dpi-status');
    ipcRenderer.on('dpi-status', (_event, value) => callback(value));
  }
});
