import * as fs from 'fs-extra';
import { ICloudStoreManager } from './type';

// tslint:disable-next-line: no-var-requires
const COS = require('cos-nodejs-sdk-v5')

class CosManager implements ICloudStoreManager {

  private cos: any;
  private bucket: string;
  private region: string;

  constructor({ Bucket, Region, SecretId, SecretKey }: any) {
    this.cos = new COS({
      SecretId,
      SecretKey,
      Timeout: 5 * 1000,
    })
    this.bucket = Bucket;
    this.region = Region;
  }

  public downloadFile(key: string, localFilePath: string) {
    return new Promise((resolve, reject) => {
      this.cos.getObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Output: fs.createWriteStream(localFilePath)
      },
        this.handleCallback(resolve, reject)
      )
    })
  }

  public deleteFile(key: string) {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key
      },
        this.handleCallback(resolve, reject)
      )
    })
  }

  public deleteMultipleFile(keys: string[]) {
    return new Promise((resolve, reject) => {
      this.cos.deleteMultipleObject({
        Bucket: this.bucket,
        Region: this.region,
        Objects: [
          keys.map((key: string) => {
            return { Key: key }
          })
        ]
      },
        this.handleCallback(resolve, reject)
      )
    })
  }

  public uploadFileByPath(key: string, localFilePath: string) {
    return new Promise((resolve, reject) => {
      this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        StorageClass: 'STANDARD',
        Body: fs.createReadStream(localFilePath),
        ContentLength: fs.statSync(localFilePath).size
      },
        this.handleCallback(resolve, reject)
      )
    })
  }

  public queryObjectInfo(key: string) {
    return new Promise((resolve, reject) => {
      this.cos.headObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key
      },
        this.handleCallback(resolve, reject)
      )
    })
  }

  public queryObjectList(prefix: string) {
    return new Promise((resolve, reject) => {
      this.cos.getBucket({
        Bucket: this.bucket,
        Region: this.region,
        Prefix: prefix
      },
        this.handleCallback(resolve, reject)
      )
    })
  }

  public uploadFileByContent(key: string, content: string, md5?: string) {
    return new Promise((resolve, reject) => {
      this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        StorageClass: 'STANDARD',
        Body: content,
      },
        md5
          ? this.handleUploadCallback(resolve, reject, md5)
          : this.handleCallback(resolve, reject)
      )
    })
  }

  private handleUploadCallback(resolve: any, reject: any, md5: string) {
    return (err: any, data: any) => {
      const Etag = (data.ETag as string).replace(/"/g, "")
      if (!err && Etag === md5) {
        // 去除多余的引号
        resolve(data)
      } else {
        reject(err)
      }
    }
  }

  private handleCallback(resolve: any, reject: any) {
    return (err: any, data: any) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    }
  }

}

export default CosManager;