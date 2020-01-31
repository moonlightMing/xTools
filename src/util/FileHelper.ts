import * as pathUtil from 'path';

const fs = window.require('fs');
const { promises } = fs;

const { app, remote } = window.require('electron');
const APP = window.process.type === 'renderer' ? remote.app : app;
const STORE_PATH = APP.getPath('userData');

const CLOUDOC_STORE_DIR = pathUtil.join(STORE_PATH, 'cloudocStore')

if (!fs.existsSync(CLOUDOC_STORE_DIR)) {
  fs.mkdirSync(CLOUDOC_STORE_DIR)
}

const fileHelper = {
  copyFile: (src: string, dest: string) => {
    return promises.copyFile(src, dest)
  },
  copyFileSync: (src: string, dest: string) => {
    return fs.copyFileSync(src, dest)
  },
  deleteFile: (path: string) => {
    return promises.unlink(path)
  },
  // 默认将用户目录下的cloudocStore文件夹作为云文档加密数据的存储路径
  docStoreDir: CLOUDOC_STORE_DIR,
  /**
   * 生成文档存储路径
   */
  docStorePath: (docRelativePath: string): string => {
    return pathUtil.join(CLOUDOC_STORE_DIR, docRelativePath);
  },
  readFile: (path: string) => {
    return promises.readFile(path, { encoding: 'utf8' })
  },
  readFileSync: (path: string): string => {
    return fs.readFileSync(path, { encoding: 'utf8' })
  },
  renameFile: (path: string, newPath: string) => {
    return promises.rename(path, newPath)
  },
  writeFile: (path: string, content: string) => {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(path, content, { encoding: 'utf8' })
      } catch (error) {
        reject(error)
      }
      resolve()
    })
  }
}

export default fileHelper;