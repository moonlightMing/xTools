import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import * as isDev from 'electron-is-dev';
import * as path from 'path';

import Auth from './auth';
import Clipboard from './clipboard'
import Tray, { TrayType } from './tray'

import './events'

// tslint:disable-next-line: no-var-requires
if (require('electron-squirrel-startup')) {
  app.quit()
}

export let mainWindow: BrowserWindow | null

enum WindowStatus {
  Auth,
  Main
}

let windowStatus: WindowStatus;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    height: 600,
    minHeight: 450,
    minWidth: 700,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: true,
    },
    width: 1200,
  })

  const urlLocation = isDev
    ? 'http://localhost:3000'
    : `file://${path.resolve(__dirname, '../index.html')}`
  mainWindow.loadURL(urlLocation)
  // Open the DevTools.
  if (isDev) {
    require('devtron').install()
    mainWindow.webContents.openDevTools()
  }

  /**
   * 主窗口准备完毕 先验证是否开启密码验证
   * 开启则先打开验证窗口
   */
  mainWindow.on('ready-to-show', () => {
    Tray.create()
    mainWindow!.webContents.send('request-has-auth-check')
    mainWindow!.webContents.send('request-init-cloudstore')
    ipcMain.once('request-has-auth-check-reply', (_, hasCheck: boolean) => {
      if (hasCheck) {
        toggleAuthMode()
      } else {
        toggleMainMode()
      }
    })
  })

  mainWindow.on('close', _ => {
    if (mainWindow) {
      mainWindow = null;
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
}

const minimizeMainWindow = () => {
  if (
    mainWindow
    && mainWindow.minimizable
    && !mainWindow.isMinimized()
  ) {
    mainWindow.minimize()
    mainWindow.setSkipTaskbar(true)
  }
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('ready', async () => {
  // 主窗口呼出/隐藏
  globalShortcut.register('ALT+`', () => {
    if (windowStatus === WindowStatus.Main) {
      if (!mainWindow) {
        return
      }
      if (mainWindow.isMinimized() || !mainWindow.isFocused()) {
        mainWindow.show()
        mainWindow.setSkipTaskbar(false)
      } else {
        minimizeMainWindow()
      }
    } else {
      if (!Auth.isAlive()) {
        Auth.create()
      }
      const authWindow = Auth.getAuthWindow()
      if (authWindow?.isMinimized() || !authWindow!.isFocused()) {
        authWindow?.show()
      } else {
        authWindow?.minimize()
      }
    }
  })

  // 多项剪贴板
  globalShortcut.register('ALT+Q', () => {
    if (Clipboard.isAlive()) {
      Clipboard.close()
    } else {
      Clipboard.create()
    }
  })

  // 锁定主窗口
  globalShortcut.register('ALT+L', () => {
    ipcMain.once('request-has-auth-check-reply', (_, hasCheck: boolean) => {
      if (hasCheck) {
        toggleAuthMode()
      }
    })
    mainWindow?.webContents.send('request-has-auth-check')
  })
})

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

/**
 * Tray
 */
app.on('will-quit', Tray.destory)

ipcMain.on('show-main-window', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.setSkipTaskbar(false)
  } else {
    createWindow()
  }
})

/**
 * 验证窗口切换至主窗口
 * 关闭验证界面
 * 打开主窗口
 * tray替换为主窗口模式
 */
const toggleMainMode = () => {
  windowStatus = WindowStatus.Main
  Auth.close()
  if (mainWindow) {
    mainWindow.show()
  } else {
    createWindow()
  }
  Tray.replace(TrayType.Main)
  mainWindow?.setSkipTaskbar(false)
  mainWindow?.webContents.send('request-has-afk-lock')
}

ipcMain.on('request-unlock-main-window', toggleMainMode)

const toggleAuthMode = () => {
  windowStatus = WindowStatus.Auth
  if (mainWindow) {
    mainWindow.minimize();
    mainWindow.setSkipTaskbar(true);
  }
  if (!Auth.isAlive()) {
    Auth.create();
  }
  Tray.replace(TrayType.Auth);
}

ipcMain.on('request-lock-main-window', toggleAuthMode)