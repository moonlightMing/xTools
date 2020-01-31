import { app, ipcMain, IpcMainEvent } from 'electron';
// tslint:disable-next-line: no-var-requires
const Registry = require('winreg');

const clientName = 'xTools';

ipcMain.on('request-auto-start', (event: IpcMainEvent, isAutoStart: boolean) => {

  const registry = new Registry({
    hive: Registry.HKCU,
    key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
  })

  if (isAutoStart) {
    registry.set(clientName, Registry.REG_SZ, app.getPath('exe'), () => {
      event.reply('resp-auto-start', true, "开机自启已设置！")
    })
  } else {
    registry.remove(clientName, () => {
      event.reply('resp-auto-start', true, "开机自启已取消！")
    })
  }

})