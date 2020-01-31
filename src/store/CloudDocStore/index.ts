import { action, computed, observable, toJS } from "mobx";
import shortid from 'shortid';
import NewDB from 'src/util/DataDB';
import uuidV1 from 'uuid/v1';
import { IDoc, IFolder, IStatus } from './type';
import { IDocListDisplayType, IDocListSortDirection, IDocListSortType } from './type';

const dbParams = {
  dbName: 'cloudoc',
  encryption: true,
  defaultValue: {
    cloudoc: {
      docListDisplayType: IDocListDisplayType.Detail,
      docListSortDirection: IDocListSortDirection.Asc,
      docListSortType: IDocListSortType.CreateTime,
      openDocListActiveKey: '',
    },
    openDocList: [] as string[],
    root: [] as Array<IDoc | IFolder>,
  }
}

export class CloudDocStore {

  @computed
  public get DocListDisplayModal(): IDocListDisplayType {
    return this.docListDisplayType;
  }

  @computed
  public get CurDocList(): Array<IDoc | IFolder> {
    return this.curDocList;
  }

  @computed
  public get DocListSort(): {
    type: IDocListSortType,
    direction: IDocListSortDirection
  } {
    return toJS({
      direction: this.docListSortDirection,
      type: this.docListSortType,
    })
  }

  @computed
  public get OpenDocList(): IDoc[] {
    return toJS(this.openDocList.map((id: string) => {
      return this.getItemById(id) as IDoc
    }))
  }

  @computed
  public get DelModalVisibled(): boolean {
    return this.delModalVisibled;
  }

  @computed
  public get CurSearchKey(): string {
    return this.curSearchKey;
  }

  @computed
  public get CurDelId(): string {
    return this.curDelId
  }

  @computed
  public get CurDelTitle(): string {
    if (this.curDelId === '') {
      return ''
    }
    const item = this.getItemById(this.curDelId)
    if (item && (item as IDoc).title) {
      return (item as IDoc).title
    } else {
      return (item as IFolder).name
    }
  }

  @computed
  public get OpenDocListActiveKey(): string {
    return this.openDocListActiveKey;
  }

  private CloudDocDB: any;

  @observable private docListDisplayType: IDocListDisplayType;
  @observable private docListSortType: IDocListSortType;
  @observable private docListSortDirection: IDocListSortDirection;

  @observable private curDelId: string;
  @observable private delModalVisibled: boolean;

  @observable private curSearchKey: string;
  @observable private curFolderId: string;
  @observable private curDocList: Array<IDoc | IFolder>;

  @observable private openDocList: string[];
  @observable private openDocListActiveKey: string;

  constructor() {
    this.reloadStore()
  }

  @action
  public reloadStore() {
    this.CloudDocDB = NewDB(dbParams)
    // 展示类型 （列表、摘要）
    this.docListDisplayType = this.CloudDocDB.get('cloudoc.docListDisplayType').value();
    // 文档列表排序类型
    this.docListSortType = this.CloudDocDB.get('cloudoc.docListSortType').value();
    this.docListSortDirection = this.CloudDocDB.get('cloudoc.docListSortDirection').value();
    // 文档激活列表中 当前展示打开的文档id
    this.openDocListActiveKey = this.CloudDocDB.get('cloudoc.openDocListActiveKey').value();
    this.curDelId = '';
    this.delModalVisibled = false;
    this.curFolderId = 'root';

    // 初始化curDocList
    this.flushDocList()

    // 初始化openDocList
    this.flushOpenDocList()
  }

  @action
  public setDocListDisplayModal(modal: IDocListDisplayType) {
    this.CloudDocDB.set('cloudoc.docListDisplayType', modal).write()
    this.docListDisplayType = modal;
  }

  @action
  public setDocListSort(type: IDocListSortType) {
    // 如果排序类型与现有的相同 则更改正逆序
    if (this.docListSortType === type) {
      if (this.docListSortDirection === IDocListSortDirection.Asc) {
        this.docListSortDirection = IDocListSortDirection.Desc;
      } else {
        this.docListSortDirection = IDocListSortDirection.Asc;
      }
    } else {
      // 不同就更改排序类型
      this.docListSortType = type
    }
    this.flushDocList()
  }

  @action
  public clearOpenDocList() {
    this.openDocList = [];
    this.CloudDocDB.set('openDocList', []).write()
    this.openDocListActiveKey = ''
    this.CloudDocDB.set('cloudoc.openDocListActiveKey', '').write()
  }

  @action
  public createTempFolder() {
    this.curDocList = this.curDocList.concat({
      id: shortid.generate(),
      pid: this.curFolderId,
      name: '',
      status: IStatus.rename,
    } as IFolder)
  }

  @action
  public toggleDelModalVisibled() {
    this.delModalVisibled = !this.delModalVisibled;
  }

  @action
  public setCurDelId(id: string) {
    this.curDelId = id;
  }

  @action
  public toggleItemRenameStatus(id: string) {
    // 修改名称需要在当前目录修改 因此直接从状态中查找
    const index = this.curDocList.findIndex((v: IDoc | IFolder) => v.id === id)
    const item = toJS(this.curDocList[index])
    if (item.status === IStatus.rename) {
      item.status = IStatus.saved
    } else {
      item.status = IStatus.rename
    }
    const copyList = toJS(this.curDocList);
    copyList[index] = item
    this.curDocList = copyList;
  }

  @action
  public setDocTitle(id: string, title: string) {
    this.CloudDocDB
      .get('root')
      .find({ id })
      .assign({ title })
      .write()
  }

  // 删除lowdb中的记录 磁盘中文件的删除交由外部去做
  public delItem(id: string): IDoc[] | undefined {

    const item: IDoc | IFolder = this.getItemById(id)

    if (!item) {
      return
    }

    // 若为文档 则直接删除 返回文档对象
    if ((item as IDoc).title) {
      this.CloudDocDB.get('root').remove({ id }).write()
      return [item as IDoc]
    }

    // 若为文件夹 这遍历旗下子节点 全部删除
    const nodes: Array<IDoc | IFolder> = [item as IFolder];

    const loopSearchChild = (pid: string) => {
      (this.CloudDocDB.get('root').filter({ pid }).value() as Array<IDoc | IFolder>)
        .map((v: IDoc | IFolder) => {
          nodes.push(v)
          if ((v as IFolder).name) {
            loopSearchChild(v.id)
          }
        })
    }

    loopSearchChild(id)

    nodes.map((v: IDoc | IFolder) => {
      this.CloudDocDB.get('root').remove({ id: v.id }).write()
    })

    // 返回所有要删除的文档记录
    return nodes
      .filter((v: IDoc | IFolder) => (v as IDoc).title) as IDoc[]
  }

  @action
  public enterFolder(id: string) {
    this.curFolderId = id;
    this.flushDocList()
  }

  @action
  public rollbackToLastFolder() {
    if (this.curFolderId === 'root') {
      return
    }
    const curFolder: IFolder = this.CloudDocDB.get('root').find({ id: this.curFolderId }).value()
    this.curFolderId = curFolder.pid
    this.flushDocList()
  }

  @action
  public backToRoot() {
    this.curFolderId = "root";
    this.flushDocList();
  }

  @action
  public createOrUpdateFolder(data: IFolder) {

    const folder: IFolder = this.CloudDocDB.get('root').find({ id: data.id }).value()

    if (folder) {
      this.CloudDocDB
        .get('root')
        .find({ id: data.id })
        .assign({ name: data.name })
        .write()
    } else {
      this.CloudDocDB.get('root').push(data).write()
    }

    this.flushDocList()
  }

  @action
  public delTempFolder() {
    this.flushDocList()
  }

  @action
  public createNewDoc(): IDoc {

    // 创建文档前需对该目录下同名文件进行区分
    let defaultName = '未命名文档';
    let suffixNumber = 1;
    while (this.docListHasRepetitionName(defaultName)) {
      defaultName = `未命名文档(${suffixNumber})`;
      suffixNumber++;
    }

    const id = shortid.generate();

    const doc: IDoc = {
      id,
      pid: this.curFolderId,
      title: defaultName,
      preview: '请填写内容',
      relativePath: uuidV1(),
      md5: '',
      createTime: new Date().getTime(),
      updateTime: 0,
      status: IStatus.saved,
      previewMode: false
    }

    this.CloudDocDB
      .get('root')
      .push(doc)
      .write();

    this.CloudDocDB
      .get('openDocList')
      .push(id)
      .write();

    this.flushDocList();
    this.flushOpenDocList();
    this.setOpenDocListActiveKey(id);
    return doc
  }

  public hasDocInCurFolder(fileMD5: string): boolean {
    const doc = this.CloudDocDB
      .get('root')
      .find({
        md5: fileMD5,
        pid: this.curFolderId,
      })
      .value()

    return doc ? true : false
  }

  @action
  public importExistDoc(
    fileName: string,
    preview: string,
    relativePath: string,
    fileMD5: string,
  ) {
    // 导入的

    const doc: IDoc = {
      id: shortid.generate(),
      pid: this.curFolderId,
      title: fileName,
      preview,
      relativePath,
      md5: fileMD5,
      createTime: new Date().getTime(),
      updateTime: 0,
      status: IStatus.saved,
      previewMode: false,
    }

    this.CloudDocDB
      .get('root')
      .push(doc)
      .write()

  }

  @action
  public delOpenDoc(id: string) {
    if (!this.openDocListHas(id)) {
      return
    }

    const list: string[] = this.CloudDocDB.get('openDocList').value()
    const delIndex = list.findIndex((v: string) => v === id)
    list.splice(delIndex, 1)
    this.CloudDocDB
      .set('openDocList', list)
      .write()
    this.flushOpenDocList()

    // 如果删除的key是当前活动状态 则活动的key修改为激活文档列表的第一个
    if (this.openDocListActiveKey === id) {
      if (this.openDocList.length !== 0) {
        this.setOpenDocListActiveKey(this.openDocList[0])
      } else {
        // 如果是最后一个
        this.setOpenDocListActiveKey('')
      }
    }
  }

  @action
  public openDoc(id: string) {
    if (this.openDocListHas(id)) {
      if (this.openDocListActiveKey !== id) {
        this.setOpenDocListActiveKey(id)
      }
      return
    }

    this.CloudDocDB
      .get('openDocList')
      .push(id)
      .write()

  }

  @action
  public setOpenDocListActiveKey(activeKey: string) {
    this.openDocListActiveKey = activeKey;
    this.CloudDocDB.set('cloudoc.openDocListActiveKey', activeKey).write();
  }

  @action
  public setCurSearchKey(key: string) {
    this.curSearchKey = key;
  }

  @action
  public searchDocTitle(key: string) {
    const searchList = this.CloudDocDB
      .get('root')
      .filter((v: IDoc | IFolder) => {
        if ((v as IDoc).title) {
          return (v as IDoc).title.indexOf(key) !== -1
        }
        return false
      })
      .value()

    this.curDocList = searchList;
    this.setCurSearchKey(key);
  }

  @action
  public flushOpenDocList() {
    this.openDocList = toJS(
      this.CloudDocDB
        .get('openDocList')
        .value()
    )
  }

  @action
  public flushDocList() {
    const list: Array<IDoc | IFolder> = toJS(
      this.CloudDocDB
        .get('root')
        .filter((v: IDoc | IFolder) => v.pid === this.curFolderId)
        .value()
    )

    const folderList = list.filter((v: IDoc | IFolder) => (v as IFolder).name)
    const docList = list.filter((v: IDoc | IFolder) => (v as IDoc).title)

    // 排序有两个因素 排序的类型 和 正逆序
    const sortFunc = () => {
      switch (this.docListSortType) {
        // 按创建时间
        case IDocListSortType.CreateTime:
          if (this.docListSortDirection === IDocListSortDirection.Asc) {
            return (a: IDoc, b: IDoc) => {
              return a.createTime - b.createTime
            }
          } else {
            return (a: IDoc, b: IDoc) => {
              return b.createTime - a.createTime
            }
          }
        // 按更新时间
        case IDocListSortType.UpdateTime:
          if (this.docListSortDirection === IDocListSortDirection.Asc) {
            return (a: IDoc, b: IDoc) => {
              return a.updateTime - b.updateTime
            }
          } else {
            return (a: IDoc, b: IDoc) => {
              return b.updateTime - a.updateTime
            }
          }
        default:
          return () => 1
      }
    }

    const sortedDocList = docList.sort(sortFunc())

    // 文件夹排序优先于文档 直接合并
    this.curDocList = folderList.concat(sortedDocList);
  }

  @action
  public updateDoc(id: string, doc: IDoc) {
    this.CloudDocDB
      .get('root')
      .find({ id })
      .assign(doc)
      .write()
  }

  @action
  public reload() {
    this.constructor()
  }

  public getAllDocList(): IDoc[] {
    return toJS(
      this.CloudDocDB
        .get('root')
        .filter((v: IDoc | IFolder) => (v as IDoc).title)
        .value()
    )
  }

  private docListHasRepetitionName(title: string): boolean {
    return this.curDocList
      .filter((v: IDoc) => v.title === title).length !== 0
  }

  private openDocListHas(id: string): boolean {
    return this.openDocList.findIndex((v: string) => v === id) !== -1;
  }

  private getItemById(id: string): IDoc | IFolder {
    return this.CloudDocDB
      .get('root')
      .find({ id })
      .value()
  }

}

export default new CloudDocStore();