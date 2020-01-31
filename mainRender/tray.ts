import { ipcMain, Menu, Tray, } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';

export let appIcon: Tray | null;
export let trayType: TrayType;

export enum TrayType {
  Auth,
  Main
}

/**
 * 菜单初始值
 */
const main: Menu = Menu.buildFromTemplate([
  {
    label: '云同步',
    enabled: false,
    submenu: [
      {
        label: '云端同步至本地',
        click: () => {
          ipcMain.emit('request-download-all-file')
        }
      },
      {
        label: '本地同步至云端',
        click: () => {
          ipcMain.emit('request-upload-all-file')
        }
      }
    ]
  },
  {
    label: '退出',
    role: 'quit'
  }
])

const auth: Menu = Menu.buildFromTemplate([
  {
    label: '退出',
    role: 'quit'
  }
])

/**
 * ipcEvents
 */
ipcMain.on('set-tray-cloudsync-enable', (_) => {
  if (!main.items[0].enabled) {
    main.items[0].enabled = true;
    if (trayType === TrayType.Main) {
      appIcon?.setContextMenu(main)
    }
  }
})

ipcMain.on('set-tray-cloudsync-disable', (_) => {
  if (main.items[0].enabled) {
    main.items[0].enabled = false;
    if (trayType === TrayType.Main) {
      appIcon?.setContextMenu(main)
    }
  }
})

/**
 * 对外API
 */
const create = () => {
  if (appIcon) {
    destory();
  }
  appIcon = new Tray(
    isDev
      ? "public/icon_16px.png"
      : path.resolve(__dirname, "../icon_16px.png")
  )
  appIcon.setToolTip("xTools");
  appIcon.on('double-click', (_) => {
    if (trayType === TrayType.Auth) {
      ipcMain.emit('show-auth-window');
    } else {
      ipcMain.emit('show-main-window');
    }
  })
}

const destory = () => {
  if (appIcon && !appIcon.isDestroyed) {
    appIcon.destroy();
    appIcon = null;
  }
}

const replace = (type: TrayType) => {
  appIcon?.setContextMenu(
    type === TrayType.Auth
      ? auth
      : main
  )
  trayType = type;
}

export default {
  create,
  destory,
  replace,
}