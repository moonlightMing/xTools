export enum NodeType {
  Folder,
  Node
}

export interface IFormPair {
  key: string
  value: string
}

export interface IData {
  id: string
  title: string
  data: IFormPair[]
  createTime: number
  updateTime: number
}

export interface INode {
  id: string
  pid: string
  title: string
  type: NodeType
}
