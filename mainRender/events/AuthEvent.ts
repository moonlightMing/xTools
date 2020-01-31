import { app, ipcMain, Point, screen } from 'electron';
import { mainWindow } from '../main';

import Auth from '../auth';

/**
 * 
 */
ipcMain.on('show-auth-window', () => {
  const authWindow = Auth.getAuthWindow();
  if (authWindow) {
    authWindow.show()
  } else {
    Auth.create()
  }
})

/**
 * 验证窗口最小化事件
 */
ipcMain.on('request-minimize-auth-windows', () => {
  Auth.getAuthWindow()!.minimize()
})

/**
 * 验证窗口关闭事件
 */
ipcMain.on('request-close-auth-windows', () => {
  app.quit()
})

/**
 * 验证窗口发来的密码校验请求
 */
ipcMain.on('request-auth-password-check', (event) => {
  if (mainWindow) {
    ipcMain.once('request-auth-password-reply', (_, pwd: string) => {
      event.reply('request-auth-password-check-reply', pwd)
    })
    mainWindow.webContents.send('request-auth-password')
  }
})

/**
 * 挂机锁
 */
let lockTimes = 0;
let curTimes = 0;
let lockInterval: NodeJS.Timeout;
let lastMousePoint: Point;

export const startOrResetAFKLockTime = (afkTimes: number) => {
  clearInterval(lockInterval)
  lastMousePoint = screen.getCursorScreenPoint()
  curTimes = 0
  lockTimes = afkTimes
  lockInterval = setInterval(() => {
    const nowPoint = screen.getCursorScreenPoint();
    if (lastMousePoint.x !== nowPoint.x || lastMousePoint.y !== nowPoint.y) {
      curTimes = 0
      lastMousePoint = nowPoint
      return
    }
    if (++curTimes >= lockTimes) {
      clearInterval(lockInterval)
      ipcMain.emit('request-lock-main-window')
    }
  }, 60 * 1000)
}

export const stopAFKLockTime = () => clearInterval(lockInterval)

ipcMain.on('start-afk-time', (_, afkTimes: number) => {
  startOrResetAFKLockTime(afkTimes)
})

ipcMain.on('change-afk-time', (_, afkTimes: number) => {
  startOrResetAFKLockTime(afkTimes)
})

ipcMain.on('stop-afk-time', () => {
  if (lockInterval) {
    stopAFKLockTime()
  }
})

ipcMain.on('request-has-afk-lock-reply', (_, afkLockEnable: number, afkTimes: number) => {
  if (afkLockEnable) {
    startOrResetAFKLockTime(afkTimes)
  }
})