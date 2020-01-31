import { ipcMain } from 'electron';
import Barrage from '../barrage'

let barrageCanUse = false

ipcMain.on('barrage-task-run', (_, taskInfo) => {
  if (!Barrage.isAlive()) {
    Barrage.create()
  }
  const timer = setInterval(() => {
    if (barrageCanUse) {
      Barrage.requestShootBarrage(taskInfo, 10)
      clearInterval(timer)
    }
  }, 1000)
})

ipcMain.on('ready-to-shoot-barrage', () => {
  barrageCanUse = true
})

ipcMain.on('shoot-barrage-end', (_) => {
  if (Barrage.isAlive()) {
    barrageCanUse = false
    Barrage.close()
  }
})