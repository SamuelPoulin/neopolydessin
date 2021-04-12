const url = require('url');
const path = require('path');
const { app, BrowserWindow, ipcMain} = require('electron');

let appWindow;

const initWindow = () => {
  appWindow = new BrowserWindow({
    // fullscreen: true,
    icon: url.format(path.join(__dirname, '/resources/icon.png')),
    height: 900,
    width: 1300,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true,
      allowRunningInsecureContent: false,
      nodeIntegration: true,
    },
  });

  // Electron Build Path
  appWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/client/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // appWindow.setMenuBarVisibility(false)

  // Initialize the DevTools.
  // appWindow.webContents.openDevTools()

  appWindow.on('closed', () => {
    appWindow = null;
  });
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, args) => {
    // Someone tried to run a second instance, we should focus our window.
    if (appWindow) {
      if (appWindow.isMinimized()) appWindow.restore();
      appWindow.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...
  app.on('ready', initWindow);
}

// Close when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    initWindow();
  }
});

app.setAsDefaultProtocolClient('polydessin');

let chatWindow;

ipcMain.on('chat-init', (event, arg) => {
  chatWindow = new BrowserWindow({
    icon: url.format(path.join(__dirname, '/resources/icon.png')),
    width: 450,
    height: 750,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true,
      allowRunningInsecureContent: false,
      nodeIntegration: true,
    },
  });

  chatWindow.on('ready-to-show', () => {
    if(appWindow) {
      appWindow.webContents.send('chat-ready');
    }
  });
  chatWindow.on('closed', () => {
    if(appWindow) {
      appWindow.webContents.send('chat-closed');
    }
  });

  chatWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/client/index.html'),
      protocol: 'file:',
      slashes: true,
      hash: '/chat',
    })
  );
});

