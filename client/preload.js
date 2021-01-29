const customTitlebar = require("custom-electron-titlebar");
const {remote} = require('electron');
const {Menu, MenuItem, dialog} = remote;
const path = require('path');
const url = require("url");

window.addEventListener("DOMContentLoaded", () => {
  const titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#2f3241"),
    icon: url.format(path.join(__dirname, '/resources/icon.png')),
  });

  const menu = new Menu();

  menu.append(new MenuItem({
    label: 'Item 1',
    submenu: [
      {
        label: 'Subitem 1',
        click: () => dialog.showMessageBox(null, {type: 'info', title: 'Subtitle 1', message: 'Subtitle 1', detail: 'You have clicked on subtitle 1', buttons: ['Ok']}),
      }
    ]
  }));

  titlebar.updateMenu(menu);

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
