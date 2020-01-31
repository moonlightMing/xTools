export enum IDocListDisplayType {
  List = 'list',
  Detail = 'detail'
}

export enum IDocListSortType {
  CreateTime = 'createtime',
  UpdateTime = 'updatetime',
  FileSize = 'filesize'
}

export enum IDocListSortDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export enum IStatus {
  // 重命名
  rename,
  // 编辑改动总
  edit,
  // 已保存
  saved,
}

export interface IFolder {
  id: string
  pid: string
  name: string
  status: IStatus
}

export interface IDoc {
  id: string
  pid: string
  title: string
  preview: string
  relativePath: string
  md5: string
  // 时间用数字去存储是为了方便排序 不用转换为moment
  createTime: number
  updateTime: number
  status: IStatus
  // 是否打开了预览模式
  previewMode: boolean
}