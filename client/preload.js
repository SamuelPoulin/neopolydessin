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
      label: "Item 1",
      submenu: [
        {
          label: "Subitem 1",
          click: () =>
            dialog.showMessageBox(null, {
              type: "info",
              title: "Subtitle 1",
              message: "Subtitle 1",
              detail: "You have clicked on subtitle 1",
              buttons: ["Ok"],
            }),
        },
        {
          label: "New editor",
          click: () => {
            chatWindow = new BrowserWindow({
              // fullscreen: true,
              icon: url.format(path.join(__dirname, "/resources/icon.png")),
              height: 800,
              width: 1000,
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
                hash: "/edit;width=400;height=400",
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
