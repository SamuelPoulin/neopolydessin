const {
  app,
  BrowserWindow
} = require('electron')
const url = require("url");
const path = require("path");

let appWindow

function initWindow() {
  appWindow = new BrowserWindow({
    // fullscreen: true,
    height: 800,
    width: 1000,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Electron Build Path
  appWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/client/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  //appWindow.setMenuBarVisibility(false)

  // Initialize the DevTools.
  // appWindow.webContents.openDevTools()

  appWindow.on('closed', function () {
    appWindow = null
  })
}

app.on('ready', initWindow)

// Close when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (win === null) {
    initWindow()
  }
})
