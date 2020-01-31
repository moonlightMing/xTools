export interface ICloudStoreManager {
  uploadFileByPath: (key: string, localFilePath: string, md5?: string) => Promise<any>
  uploadFileByContent: (key: string, content: string, md5?: string) => Promise<any>
  deleteFile: (key: string) => Promise<any>
  deleteMultipleFile: (keys: string[]) => Promise<any>
  downloadFile: (key: string, localFilePath: string) => Promise<any>
  queryObjectInfo: (key: string) => Promise<any>
  queryObjectList: (prefix: string) => Promise<any>
}

export interface ICloudStoreParams {
  Bucket: string,
  Region: string,
  SecretId: string,
  SecretKey: string
}