const { ipcRenderer } = window.require('electron');
import CloudDocStore from './CloudDocStore';
import PassbookStore from './PassbookStore';
import SettingStore from './SettingStore';
import TaskManagerStore from './TaskManagerStore';

/**
 * 请求初始化云同步客户端
 */
ipcRenderer.once('request-init-cloudstore', (event, _) => {
  if (SettingStore.CloudAuthChecked) {
    event.sender.send('init-cloudstore',
      SettingStore.AutoAsync,
      {
        Bucket: SettingStore.Bucket,
        Region: SettingStore.Region,
        SecretId: SettingStore.SecretId,
        SecretKey: SettingStore.SecretKey
      },
      SettingStore.curObjectStoreType
    )
  }
})

/**
 * 返回本地所有文档列表
 */
ipcRenderer.on('query-all-local-doc-file', (event, _) => {
  event.sender.send(
    'query-all-local-doc-file-reply',
    CloudDocStore.getAllDocList()
  )
})

/**
 * 重载store状态
 */
ipcRenderer.on('reload-stores', () => {
  CloudDocStore.reloadStore()
  PassbookStore.reloadStore()
  TaskManagerStore.reloadStore()
})

/**
 * 检查是否启用密码验证
 */
ipcRenderer.on('request-has-auth-check', (event) => {
  const hasCheck = SettingStore.EnableAuthCheck && SettingStore.CurAuthPassword !== '';
  event.sender.send(
    'request-has-auth-check-reply',
    hasCheck
  )
})

ipcRenderer.on('request-auth-password', (event) => {
  event.sender.send(
    'request-auth-password-reply',
    SettingStore.CurAuthPassword
  )
})

ipcRenderer.on('request-has-afk-lock', (event) => {
  event.sender.send(
    'request-has-afk-lock-reply',
    SettingStore.AfkLockEnable,
    SettingStore.AfkTime
  )
})