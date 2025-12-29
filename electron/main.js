import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, clipboard } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import fs from 'fs';

// Setup logging
const LOG_FILE = path.join(app.getPath('userData'), 'app.log');
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {
    console.error('Failed to write log:', e);
  }
}

// Global exception handler
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.stack || error}`);
  dialog.showErrorBox('Application Error', `An unexpected error occurred:\n${error.message}`);
});

log('App starting...');
log(`NODE_ENV: ${process.env.NODE_ENV}`);


// Disable hardware acceleration to prevent transparent window issues
// app.disableHardwareAcceleration();
log('Hardware acceleration setting skipped (default)');

let tray = null;
let win = null;
let obsServer = null;
let obsServerUrl = null;
let currentAppConfig = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

function buildTrayTemplate() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (raw && Array.isArray(raw.profiles)) {
        currentAppConfig = raw;
      } else if (raw) {
        currentAppConfig = {
          soundEnabled: !!raw.soundEnabled,
          activeProfileId: 'default',
          profiles: [{
            id: 'default',
            name: '默认配置',
            theme: raw.theme || 'cyberpunk',
            items: Array.isArray(raw.items) ? raw.items : [],
            hiddenMode: !!raw.hiddenMode,
            visiblePercentage: raw.visiblePercentage ?? 20,
            spinDurationSec: raw.spinDurationSec ?? 8,
          }],
        };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentAppConfig, null, 2));
      }
    }
  } catch (e) {
    log(`Failed to read config for tray menu: ${e}`);
  }

  const profiles = Array.isArray(currentAppConfig?.profiles) ? currentAppConfig.profiles : [];
  const activeId = currentAppConfig?.activeProfileId;
  const soundEnabled = !!currentAppConfig?.soundEnabled;
  try {
    log(`Tray menu building: profiles=${profiles.length} active=${activeId}`);
    log(`Profile names: ${profiles.map(p => p.name).join(',')}`);
  } catch {}

  return [
    { label: '显示转盘', click: () => win && win.show() },
    { 
      label: '开始旋转', 
      click: () => {
        log('Tray clicked: start spin');
        try {
          win && win.webContents.send('tray-spin');
        } catch (e) {
          log(`Failed to send tray-spin: ${e}`);
        }
      } 
    },
    { label: '隐藏转盘', click: () => win && win.hide() },
    { 
      label: '音效开关', 
      type: 'checkbox', 
      checked: soundEnabled, 
      click: (menuItem) => {
        try {
          win && win.webContents.send('tray-toggle-sound', menuItem.checked);
          if (currentAppConfig) {
            currentAppConfig.soundEnabled = menuItem.checked;
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentAppConfig, null, 2));
          }
        } catch (e) {
          log(`Failed to toggle sound from tray: ${e}`);
        }
      } 
    },
    { type: 'separator' },
    { 
      label: '窗口置顶开关', 
      type: 'checkbox', 
      checked: true, 
      click: (menuItem) => { win && win.setAlwaysOnTop(menuItem.checked, 'normal'); } 
    },
    { type: 'separator' },
    { 
      label: '退出程序', 
      click: () => { 
        app.isQuitting = true; 
        app.quit(); 
      } 
    },
  ];
}

// Create config file if it doesn't exist
if (!fs.existsSync(CONFIG_FILE)) {
  const DEFAULT_CONFIG = {
    soundEnabled: true,
    activeProfileId: 'default',
    profiles: [
      {
        id: 'default',
        name: '默认配置',
        theme: 'cyberpunk',
        items: [
          { id: '1', text: '超级大奖', probability: 5 },
          { id: '2', text: '再接再厉', probability: 20 },
          { id: '3', text: '神秘礼物', probability: 10 },
          { id: '4', text: '666', probability: 15 },
          { id: '5', text: '恭喜发财', probability: 15 },
          { id: '6', text: '谢谢参与', probability: 35 },
        ],
        hiddenMode: false,
        visiblePercentage: 20,
        spinDurationSec: 8,
      }
    ]
  };
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
  } catch (e) {
    console.error('Failed to create default config file', e);
  }
}

// IPC Handlers
ipcMain.handle('read-config', async () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    log(`Failed to read config: ${e}`);
  }
  return null;
});

ipcMain.handle('write-config', async (event, newConfig) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    currentAppConfig = newConfig;
    
    // Update Tray
    if (tray) {
      const contextMenu = Menu.buildFromTemplate(buildTrayTemplate());
      tray.setContextMenu(contextMenu);
    }
    
    return true;
  } catch (e) {
    log(`Failed to write config: ${e}`);
    return false;
  }
});

ipcMain.handle('get-config-path', () => CONFIG_FILE);

function createWindow() {
  log('Creating window...');
  win = new BrowserWindow({
    width: 800,
    height: 900,
    transparent: true, // Transparent window
    frame: false,      // No window frame (borderless)
    hasShadow: false,
    skipTaskbar: false,
    show: false,       // Don't show until ready
    // backgroundColor: '#00000000', // Let Electron handle transparency
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Always on top for live streaming overlay
  // Use 'normal' level instead of 'screen-saver' to avoid potential system border issues
  win.setAlwaysOnTop(true, 'normal');

  // In production, load the local index.html
  // In development, load the vite dev server
  if (process.env.NODE_ENV === 'development') {
    log('Loading dev server...');
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Check if the file exists before loading
    // Use app.getAppPath() to correctly resolve path inside ASAR
    const appPath = app.getAppPath();
    const indexPath = path.join(appPath, 'dist/index.html');
    log(`Loading production index from: ${indexPath}`);
    
    if (fs.existsSync(indexPath)) {
      win.loadFile(indexPath).catch(e => {
        log(`Failed to load index.html: ${e}`);
      });
    } else {
      // Fallback: try relative to __dirname (useful if not in ASAR or different structure)
      const fallbackPath = path.join(__dirname, '../dist/index.html');
      log(`Primary path not found, trying fallback: ${fallbackPath}`);
      if (fs.existsSync(fallbackPath)) {
        win.loadFile(fallbackPath).catch(e => log(`Failed to load fallback: ${e}`));
      } else {
        log(`ERROR: index.html not found at ${indexPath} or ${fallbackPath}`);
        dialog.showErrorBox('Error', `Could not find application entry point.\nPrimary: ${indexPath}\nFallback: ${fallbackPath}`);
      }
    }
  }

  // Ready to show
  win.once('ready-to-show', () => {
    log('Window ready to show');
    win.show();
  });

  win.webContents.on('did-finish-load', () => {
    log('Window finished loading content');
    if (!win.isVisible()) {
      win.show();
    }
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Window failed to load: ${errorCode} - ${errorDescription}`);
  });

  // Prevent window from closing, just hide it
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
      log('Window hidden instead of closed');
    } else {
      log('Window closing...');
    }
    return false;
  });
}

/*
function startObsServer() {
  // OBS server functionality removed
}
*/

function createTray() {
  log('Creating tray...');
  let icon = null;
  try {
    const devPng = path.join(__dirname, '../public/icon.png');
    if (fs.existsSync(devPng)) {
      icon = nativeImage.createFromPath(devPng);
    }
  } catch {}
  if (!icon || icon.isEmpty()) {
    try {
      const prodPng = path.join(process.resourcesPath, 'icon.png');
      if (fs.existsSync(prodPng)) {
        icon = nativeImage.createFromPath(prodPng);
      }
    } catch {}
  }
  if (!icon || icon.isEmpty()) {
    try {
      icon = nativeImage.createFromPath(process.execPath);
    } catch {}
  }
  if (!icon || icon.isEmpty()) {
    try {
      const size = 16;
      const buf = Buffer.alloc(size * size * 4);
      for (let i = 0; i < size * size; i++) {
        const idx = i * 4;
        buf[idx] = 255;     // R
        buf[idx + 1] = 0;   // G
        buf[idx + 2] = 0;   // B
        buf[idx + 3] = 255; // A
      }
      icon = nativeImage.createFromBitmap(buf, { width: size, height: size });
    } catch {
      icon = nativeImage.createEmpty();
    }
  }
  try {
    tray = new Tray(icon);
    tray.setToolTip('直播转盘');
    tray.setContextMenu(Menu.buildFromTemplate(buildTrayTemplate()));
    tray.on('click', () => { if (win.isVisible()) { win.hide(); } else { win.show(); } });
    log('Tray created successfully');
  } catch (error) {
    log(`Failed to create tray: ${error}`);
  }
}

app.whenReady().then(() => {
  log('App ready');
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (raw && !('profiles' in raw)) {
        currentAppConfig = {
          soundEnabled: !!raw.soundEnabled,
          activeProfileId: 'default',
          profiles: [{
            id: 'default',
            name: '默认配置',
            theme: raw.theme || 'cyberpunk',
            items: Array.isArray(raw.items) ? raw.items : [],
            hiddenMode: !!raw.hiddenMode,
            visiblePercentage: raw.visiblePercentage ?? 20,
            spinDurationSec: raw.spinDurationSec ?? 8,
          }],
        };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentAppConfig, null, 2));
      } else {
        currentAppConfig = raw;
      }
    }
  } catch {}
  createWindow();
  createTray();
  // startObsServer(); // Removed OBS server

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  log('App before-quit');
  app.isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers for Config ---

ipcMain.handle('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

// Handlers are already registered above; do not re-register here to avoid duplicate handler error.
