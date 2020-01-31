import { app, ipcMain, IpcMainEvent, Notification, remote } from 'electron';
import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import { CosManager } from '../cloudStore';
import { ICloudStoreManager, ICloudStoreParams } from '../cloudStore/type';
import { mainWindow } from '../main';
import Tray from '../tray';

const APP = process.type === 'renderer' ? remote.app : app
const STORE_PATH = APP.getPath('userData')
const DOC_STORE_PATH = path.join(STORE_PATH, 'cloudocStore')

let cloudStoreManager: ICloudStoreManager | null;
// 云文档、密码本、计划任务三个功能的存储db
const storeDBNames = ['cloudoc.json', 'passbook.json', 'taskmanager.json']

export enum ObjectStoreType {
  TencentCOS = "腾讯云COS",
}

const notify = (title: string, body: string) => {
  new Notification({ title, body }).show()
}

/**
 * 云同步密钥认证成功 初始化SDK客户端
 * 如果打开了自动同步 则尝试同步
 */
ipcMain.on('init-cloudstore', (_, isAutoSync, cloudInitArgs, osType: ObjectStoreType) => {
  try {
    switch (osType) {
      case ObjectStoreType.TencentCOS:
        cloudStoreManager = new CosManager(cloudInitArgs);
      default:
        cloudStoreManager = new CosManager(cloudInitArgs);
    }
  } catch (error) {
    console.log("err", error)
  }

  ipcMain.emit('set-tray-cloudsync-enable')
  /**
   * 云同步对象初始化完毕后 需要云端对比
   * 云端较新：云端同步至本地
   * 本地较新：无动作
   */
  if (isAutoSync) {
    Promise.all(
      storeDBNames.map((dbName: string) => {
        return cloudStoreManager!
          .queryObjectInfo(dbName)
          .then((data) => {
            if (data && data.statusCode === 200) {
              fs.stat(path.join(STORE_PATH, dbName), (error, stats) => {
                if (error) {
                  return
                }
                const cloudStoreLastModified = data.headers['last-modified']
                const localStoreMtime = stats.mtime
                if (moment(cloudStoreLastModified).isAfter(localStoreMtime)) {
                  cloudStoreManager!.downloadFile(
                    dbName,
                    path.join(STORE_PATH, dbName)
                  ).catch((err) => {
                    throw err
                  })
                }
              })
            }
          })
      })
    ).then(() => {
      notify("云端同步完毕", "云端新内容已同步至本地")
    }).catch(() => {
      notify("云端同步失败", "云端内容校验失败，请检查网络")
    })
  }
})

ipcMain.on('cloudstore-auth-check', (event, args: ICloudStoreParams, osType: ObjectStoreType) => {
  const testFilename = '.test.txt';
  const resp = (info: any) => event.reply('cloudstore-auth-check-reply', info);
  let manager: ICloudStoreManager;
  switch (osType) {
    case ObjectStoreType.TencentCOS:
      manager = new CosManager(args)
    default:
      manager = new CosManager(args)
  }
  manager.uploadFileByContent(testFilename, 'banana')
    .then((_) => {
      manager.deleteFile(testFilename)
        .then((d: any) => {
          if (d.statusCode === 204) {
            resp('ok')
            cloudStoreManager = manager;
            ipcMain.emit('set-tray-cloudsync-enable')
          } else {
            resp(d)
          }
        })
        .catch(resp)
    })
    .catch(resp)
})

ipcMain.on('request-upload-doc', (
  event,
  doc: { id: string, key: string, path: string, md5?: string }
) => {
  cloudStoreManager!.uploadFileByPath(
    doc.key,
    doc.path,
    doc.md5
  ).then((d: any) => {
    event.reply('request-upload-doc-reply', {
      docId: doc.id,
      syncDate: d.headers.date
    })
  }).catch((err) => {
    notify("文档同步失败", "文档数据同步失败，请检查网络！")
  })
})

ipcMain.on('request-upload-multiple-doc', (_, docs: Array<{ key: string, path: string, md5?: string }>) => {
  Promise.all(
    docs.map((doc) => {
      return cloudStoreManager!.uploadFileByPath(
        `cloudocStore/${doc.key}`,
        doc.path,
        doc.md5
      )
    })
  ).catch(() => {
    notify("文档同步失败", "文档数据同步失败，请检查网络！")
  })
})

ipcMain.on('request-upload-store', (_, storeName: string) => {
  const storeFileName = `${storeName}.json`
  cloudStoreManager!.uploadFileByPath(
    storeFileName,
    `${STORE_PATH}/${storeFileName}`
  ).catch(() => {
    notify("数据同步失败", "文档元数据同步失败，请检查网络！")
  })
})

ipcMain.on('request-delete-doc', (_, docKeys: string[]) => {
  cloudStoreManager!
    .deleteMultipleFile(docKeys)
    .catch(() => {
      notify("文档同步失败", "文档数据同步失败，请检查网络！")
    })
})

/**
 * 本地文件同步至云端
 */

ipcMain.on('request-upload-all-file', () => {
  Promise.all(
    storeDBNames.map((dbName: string) => {
      return cloudStoreManager!.uploadFileByPath(dbName, path.join(STORE_PATH, dbName))
    })
  ).then(() => {
    notify("数据上传成功", "配置同步成功")
  }).catch((err) => {
    notify("数据上传失败", "配置同步错误")
  })

  if (mainWindow) {
    mainWindow.webContents.send('query-all-local-doc-file')
  }
})

ipcMain.on('query-all-local-doc-file-reply', (_: IpcMainEvent, cloudDocs) => {
  Promise.all(
    cloudDocs.map((doc: { relativePath: string }) => {
      return cloudStoreManager!.uploadFileByPath(
        `cloudocStore/${doc.relativePath}`,
        path.join(STORE_PATH, 'cloudocStore', doc.relativePath)
      )
    })
  ).then(() => {
    notify("本地文档上传成功", "文档同步完成")
  }).catch((err) => {
    notify("本地文档上传失败", "文档同步错误")
  })
})

/**
 * 云端同步至本地
 */
interface IContents {
  Key: string
  LastModified: string
  ETag: string
  Size: number
  Owner: { ID: string, DisplayName: string }
  StorageClass: string
}

ipcMain.on('request-download-all-file', () => {
  Promise.all(
    storeDBNames.map((dbName: string) => {
      return cloudStoreManager!.downloadFile(dbName, path.join(STORE_PATH, dbName))
    })
  ).then(() => {
    mainWindow!.webContents.send('reload-stores')
  }).catch(() => {
    notify("数据下载失败", "配置同步错误")
  })

  cloudStoreManager!.queryObjectList("cloudocStore/")
    .then((data) => {
      if (data && data.statusCode !== 200) {
        notify("文档下载失败", "")
        return
      }
      const { Contents } = data;
      // 第一个是文件夹对象 去除
      (Contents as IContents[]).shift()
      Promise.all(
        (Contents as IContents[]).map((content: IContents) => {
          return cloudStoreManager!
            .downloadFile(
              content.Key,
              path.join(DOC_STORE_PATH, content.Key.split('/')[1])
            )
        })
      ).then(() => {
        mainWindow!.webContents.send('reload-editor-content')
      }).catch(() => {
        notify("文档数据下载失败", "请检查网络")
      })
    }).catch(() => {
      notify("文档信息获取失败", "请检查网络")
    })
})