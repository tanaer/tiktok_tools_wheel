const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => ipcRenderer.invoke('read-config'),
  writeConfig: (config) => ipcRenderer.invoke('write-config', config),
  getConfigPath: () => ipcRenderer.invoke('get-config-path'),
  onTraySpin: (cb) => {
    const handler = () => cb && cb();
    ipcRenderer.on('tray-spin', handler);
    return () => ipcRenderer.removeListener('tray-spin', handler);
  },
  onTrayToggleSound: (cb) => {
    const handler = (_e, enabled) => cb && cb(enabled);
    ipcRenderer.on('tray-toggle-sound', handler);
    return () => ipcRenderer.removeListener('tray-toggle-sound', handler);
  },
  quitApp: () => ipcRenderer.invoke('quit-app')
});
