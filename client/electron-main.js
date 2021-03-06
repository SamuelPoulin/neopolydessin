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
    width: 400,
    height: 750,
    frame: false,
    resizable: false,
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

ipcMain.on('chat-update', (event, arg) => {
  if(chatWindow) {
    chatWindow.webContents.send('chat-update', arg);
  }
});

ipcMain.on('chat-quit', (event, arg) => {
  if(chatWindow) {
    chatWindow.close();
  }
});

ipcMain.on('chat-scrolldown', (event, arg) => {
  if(chatWindow) {
    chatWindow.webContents.send('chat-scrolldown');
  }
});

ipcMain.on('chat-action-send-guess', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-send-guess', arg);
  }

});
ipcMain.on('chat-action-send-message', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-send-message', arg);
  }

});
ipcMain.on('chat-action-focus-room', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-focus-room', arg);
  }

});
ipcMain.on('chat-action-close-room', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-close-room', arg);
  }
});

ipcMain.on('chat-action-toggle-guess', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-toggle-guess');
  }
});

ipcMain.on('chat-action-toggle-friends', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-toggle-friends');
  }
});

ipcMain.on('chat-action-toggle-rooms', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-toggle-rooms');
  }
});

ipcMain.on('chat-action-create-dm', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-create-dm', arg);
  }
});

ipcMain.on('chat-action-create-room', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-create-room', arg);
  }
});

ipcMain.on('chat-action-delete-room', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-delete-room', arg);
  }
});

ipcMain.on('chat-action-join-room', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-join-room', arg);
  }
});

ipcMain.on('chat-action-leave-room', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-leave-room', arg);
  }
});

ipcMain.on('chat-action-add-friend', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-add-friend', arg);
  }
});

ipcMain.on('chat-action-remove-friend', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-remove-friend', arg);
  }
});

ipcMain.on('chat-action-confirm-friend', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-confirm-friend', arg);
  }
});

ipcMain.on('chat-action-reject-friend', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-reject-friend', arg);
  }
});

ipcMain.on('chat-action-invite-friend', (event, arg) => {
  if(appWindow) {
    appWindow.webContents.send('chat-action-invite-friend', arg);
  }
});