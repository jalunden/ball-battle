'use strict';
const { app, BrowserWindow, session } = require('electron');
const path = require('node:path');

const gameFile = path.join(__dirname, '..', 'index.html');
app.setName('Ball Battle');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // no remote web content is loaded

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 850, minWidth: 900, minHeight: 620,
    backgroundColor: '#111b37', autoHideMenuBar: true,
    title: 'Ball Battle – Windows Edition',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      sandbox: true, webSecurity: true
    }
  });
  win.setMenuBarVisibility(false);
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });
  win.loadFile(gameFile);
}
app.whenReady().then(() => {
  // The desktop edition never contacts Cloudflare or other external services.
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] }, (_details, callback) => callback({ cancel: true }));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
