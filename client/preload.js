const customTitlebar = require("custom-electron-titlebar");
const { remote } = require("electron");
const { Menu, MenuItem, dialog, BrowserWindow } = remote;
const path = require("path");
const url = require("url");

window.addEventListener("DOMContentLoaded", () => {
  const titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#2f3241"),
    icon: url.format(path.join(__dirname, "/resources/icon.png")),
  });

  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: "View",
      submenu: [
        {
          label: "Chat",
          click: () => {
            chatWindow = new BrowserWindow({
              icon: url.format(path.join(__dirname, "/resources/icon.png")),
              width: 450,
              height: 750,
              frame: false,
              webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                enableRemoteModule: true,
                allowRunningInsecureContent: false,
                nodeIntegration: true,
              },
            });

            chatWindow.loadURL(
              url.format({
                pathname: path.join(__dirname, "dist/client/index.html"),
                protocol: "file:",
                slashes: true,
                hash: "/chat",
              })
            );
          },
        },
      ],
    })
  );

  titlebar.updateMenu(menu);

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
