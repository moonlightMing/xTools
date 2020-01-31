import { BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';

let barrageWindow: BrowserWindow | null;

const isAlive = (): boolean => {
  return barrageWindow !== undefined && barrageWindow !== null;
};

const close = () => {
  if (barrageWindow) {
    barrageWindow.close();
  }
}

const create = () => {
  barrageWindow = new BrowserWindow({
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: true,
    },
  });

  barrageWindow.maximize()
  barrageWindow.setAlwaysOnTop(true, 'pop-up-menu')
  barrageWindow.setIgnoreMouseEvents(true, { forward: true })
  barrageWindow.removeMenu()

  if (isDev) {
    barrageWindow.webContents.openDevTools()
  }

  barrageWindow.loadURL(
    isDev
      ? `file://${path.resolve(__dirname, '../../public/barrage/index.html')}`
      : `file://${path.resolve(__dirname, '../barrage/index.html')}`
  )

  barrageWindow.on('closed', () => {
    barrageWindow = null;
  })

  barrageWindow.on('ready-to-show', () => {
    barrageWindow!.show()
  })

}

const requestShootBarrage = (taskInfo: string, barrageDensity: number) => {
  if (barrageWindow) {
    barrageWindow.webContents.send('shoot-barrage', taskInfo, barrageDensity)
  }
}

export default {
  close,
  create,
  isAlive,
  requestShootBarrage
}
