const { app, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");

let appWindow;

function initWindow() {
  appWindow = new BrowserWindow({
    // fullscreen: true,
    icon: url.format(path.join(__dirname, "/resources/icon.png")),
    height: 900,
    width: 1300,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: true,
      allowRunningInsecureContent: false,
      nodeIntegration: true,
    },
  });

  // Electron Build Path
  appWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "dist/client/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  //appWindow.setMenuBarVisibility(false)

  // Initialize the DevTools.
  // appWindow.webContents.openDevTools()

  appWindow.on("closed", function() {
    appWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, args) => {
    // Someone tried to run a second instance, we should focus our window.
    if (appWindow) {
      if (appWindow.isMinimized()) appWindow.restore();
      appWindow.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...
  app.on("ready", initWindow);
}

// Close when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS specific close process
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (win === null) {
    initWindow();
  }
});

app.setAsDefaultProtocolClient("polydessin");
