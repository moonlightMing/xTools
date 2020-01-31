import path from 'path';
import CryptoUtil from 'src/util/Crypto';
import fileHelper from 'src/util/FileHelper';

const { app, remote } = window.require('electron');
const fs = window.require('fs-extra');
const low = window.require('lowdb');
const FileSync = window.require('lowdb/adapters/FileSync');

const APP = window.process.type === 'renderer' ? remote.app : app
const STORE_PATH = APP.getPath('userData')

if (window.process.type !== 'renderer') {
  if (!fs.pathExistsSync(STORE_PATH)) {
    fs.mkdirpSync(STORE_PATH)
  }
}

const deserialize = (data: any) => JSON.parse(CryptoUtil.decrypt(data))
const serialize = (data: any) => CryptoUtil.encrypt(JSON.stringify(data))

const NewDB = (
  {
    dbName,
    encryption,
    defaultValue
  }: {
    dbName: string,
    encryption: boolean,
    defaultValue: any
  }
) => {
  const storePath = path.join(STORE_PATH, `${dbName}.json`);
  const adapter = new FileSync(
    storePath,
    encryption
      ? { deserialize, serialize }
      : {}
  )
  const db = low(adapter)
  if (
    fileHelper.readFileSync(storePath) === "{}"
    ||
    fileHelper.readFileSync(storePath) === "kWzoqteYWsl4ex0WRopdkw=="
  ) {
    db.defaults(defaultValue).write()
  }
  return db
}

export default NewDB;
