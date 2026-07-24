const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow;

// Start backend server
require('./backend/server.js');

function waitForServer(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      http.get(url, (res) => {
        resolve(true);
      }).on('error', (err) => {
        if (Date.now() - startTime > timeoutMs) {
          reject(err);
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'SSI Measure - Smart Inspection System',
    icon: path.join(__dirname, 'frontend/public/vite.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove default menu bar for clean native app look
  mainWindow.setMenuBarVisibility(false);

  const serverUrl = 'http://localhost:3001';

  waitForServer(serverUrl)
    .then(() => {
      mainWindow.loadURL(serverUrl);
    })
    .catch(() => {
      mainWindow.loadURL(serverUrl);
    });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
