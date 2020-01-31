import { BrowserWindow, clipboard, globalShortcut, screen } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';
import * as robotjs from 'robotjs';

let clipboardWindow: BrowserWindow | null;
let strArray: string[] = [];

const isAlive = () => {
  return clipboardWindow !== undefined && clipboardWindow !== null;
};

const close = () => {
  if (clipboardWindow) {
    clipboardWindow.close();
  }
};

const create = () => {
  clipboardWindow = new BrowserWindow({
    alwaysOnTop: true,
    autoHideMenuBar: true,
    frame: false,
    height: 260,
    movable: true,
    resizable: true,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: true,
    },
    width: 360,
    // 窗口初始化位置在最右侧
    x: screen.getPrimaryDisplay().workAreaSize.width - 380,
    y: 200,
  });

  clipboardWindow.removeMenu()

  if (isDev) {
    clipboardWindow.webContents.openDevTools();
  }

  clipboardWindow.loadURL(
    isDev
      ? `file://${path.resolve(__dirname, '../../public/clipboard/index.html')}`
      : `file://${path.resolve(__dirname, '../clipboard/index.html')}`
  );

  clipboardWindow.on('ready-to-show', () => {
    clipboardWindow!.show();
    strArray = [];
    registerShortcut();
  });

  clipboardWindow.on('closed', () => {
    unregisterShortcut();
    clipboardWindow = null;
  });
};



const registerShortcut = () => {
  for (let index = 1; index <= 4; index++) {
    globalShortcut.register(`ALT+${index}`, () => {
      robotjs.keyTap("insert", "control")
      const content = clipboard.readText()
      strArray[index] = content;
      clipboardWindow!.webContents.send("copy-to-board", index, content);
    })

    globalShortcut.register(`F${index}`, () => {
      if (strArray[index]) {
        clipboard.writeText(strArray[index])
        robotjs.keyTap("insert", "shift")
      }
    })
  }
}

const unregisterShortcut = () => {
  for (let index = 1; index <= 4; index++) {
    globalShortcut.unregister(`ALT+${index}`);
    globalShortcut.unregister(`F${index}`)
  }
};

export default {
  close,
  create,
  isAlive,
};
