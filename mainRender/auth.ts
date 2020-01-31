import { BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';

let authWindow: BrowserWindow | null;

const isAlive = (): boolean => {
  return authWindow !== undefined && authWindow !== null;
};

const close = () => {
  if (authWindow) {
    authWindow.close();
  }
}

const getAuthWindow = (): BrowserWindow | null => {
  return authWindow;
}

const create = () => {
  authWindow = new BrowserWindow({
    autoHideMenuBar: true,
    center: true,
    height: 520,
    width: 420,
    movable: true,
    resizable: false,
    show: false,
    transparent: true,
    frame: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: true,
    },
  });

  if (isDev) {
    authWindow.webContents.openDevTools();
  }

  authWindow.loadURL(
    isDev
      ? `file://${path.resolve(__dirname, '../../public/auth/index.html')}`
      : `file://${path.resolve(__dirname, '../auth/index.html')}`
  )

  authWindow.on('ready-to-show', () => {
    authWindow!.show();
  })

  authWindow.on('closed', () => {
    authWindow = null;
  })
}

export default {
  close,
  create,
  isAlive,
  getAuthWindow
}