import { action, computed, observable, toJS, } from 'mobx';
import shortid from 'shortid';
import NewDB from 'src/util/DataDB';
import { IData, IFormPair, INode, NodeType } from './type';

const dbParams = {
  dbName: 'passbook',
  encryption: true,
  defaultValue: {
    data: {} as Map<string, IData>,
    root: [] as INode[],
  }
}

export class PassbookStore {

  // value: passbook
  @computed
  public get passbookValue(): INode[] {
    return toJS(this.passbook);
  }

  // value: addFolderFormVisibled
  @computed
  public get addFolderFormVisibledValue(): boolean {
    return this.addFolderFormVisibled;
  }

  // value: addNodeFormVisibled
  @computed
  public get addNodeFormVisibledValue(): boolean {
    return this.addNodeFormVisibled;
  }

  // value: selectNode
  @computed
  public get selectedNodeIdValue(): string {
    return this.selectedNodeId;
  }

  @computed
  public get selectedNodeTypeValue(): NodeType {
    if (this.selectedNodeId === 'root') {
      return NodeType.Folder;
    }
    return this.searchNode(this.selectedNodeId).type;
  }

  @computed
  public get selectedNodeDataValue(): IData[] {
    return this.selectedNodeData;
  }

  @computed
  public get searchKeyValue(): string {
    return this.searchKey;
  }

  // 当处于搜索状态时 Tree需要主动展开父节点
  @computed
  public get autoExpandParentValue(): boolean {
    return this.searchKey !== '';
  }

  @computed
  public get expandedKeysValue(): string[] {
    return this.expandedKeys;
  }

  @computed
  public get delNodeFormVisibledValue(): boolean {
    return this.delNodeFormVisibled;
  }

  @computed
  public get dirTagVisibleValue(): boolean {
    return this.dirTagVisible;
  }

  @computed
  public get selectedNodePathValue(): string[] {
    if (this.selectedNodeId === 'root') {
      return []
    }

    let curNode = this.searchNode(this.selectedNodeId)
    const dirArray: string[] = [curNode.title];
    while (curNode.pid !== 'root') {
      curNode = this.searchNode(curNode.pid)
      dirArray.unshift(curNode.title)
    }

    return dirArray;
  }

  @computed
  public get delFormTitleValue(): string {
    if (this.deleteNodeId === '') {
      return '';
    }
    return this.searchNode(this.deleteNodeId)?.title;
  }

  private PassbookDB: any;
  @observable private passbook: INode[];
  @observable private dirTagVisible: boolean;
  @observable private selectedNodeId: string;
  @observable private deleteNodeId: string;
  @observable private editNodeId: string;
  @observable private editNodeData: IData;
  @observable private selectedNodeData: IData[]
  @observable private addFolderFormVisibled: boolean;
  @observable private addNodeFormVisibled: boolean;
  @observable private editNodeFormVisibled: boolean;
  @observable private delNodeFormVisibled: boolean;
  @observable private searchKey: string;
  @observable private expandedKeys: string[];

  constructor() {
    this.reloadStore()
  }

  @action
  public reloadStore() {
    this.PassbookDB = NewDB(dbParams)
    this.selectedNodeId = 'root';
    this.dirTagVisible = false;
    this.deleteNodeId = '';
    this.editNodeId = '';
    this.editNodeData = { id: '', title: '', data: [], createTime: 0, updateTime: 0 };
    this.selectedNodeData = [];
    this.passbook = this.PassbookDB.get('root').value();
    this.addFolderFormVisibled = false;
    this.addNodeFormVisibled = false;
    this.editNodeFormVisibled = false;
    this.delNodeFormVisibled = false;
  }

  @action
  public setEditNodeId(id: string) {
    this.editNodeId = id;
    this.editNodeData = this.getData(this.editNodeId)
  }

  @action
  public setDirTagVisible(isVisible: boolean) {
    this.dirTagVisible = isVisible;
  }

  @computed
  public get editNodeFormVisibledValue(): boolean {
    return this.editNodeFormVisibled;
  }

  @computed
  public get editNodeDataValue(): IData {
    return toJS(this.editNodeData);
  }

  @action
  public setDeleteNodeId(id: string) {
    this.deleteNodeId = id;
  }

  @computed
  public get deleteNodeIdValue() {
    return this.deleteNodeId;
  }

  // action: node
  @action
  public addFolder(title: string) {
    const newId = shortid.generate();
    this.PassbookDB
      .get('root')
      .push({
        id: newId,
        pid: this.selectedNodeId,
        title,
        type: NodeType.Folder,
      } as INode)
      .write()

    this.selectedNodeId = newId;
    this.reloadPassbook()
  }

  @action
  public addNode(title: string, data: IFormPair[]) {
    const newId = shortid.generate();
    this.PassbookDB.get('root')
      .push({
        id: newId,
        pid: this.selectedNodeId,
        title,
        type: NodeType.Node,
      } as INode)
      .write()

    this.PassbookDB.get('data')
      .set(newId, {
        id: newId,
        title,
        data,
        createTime: new Date().getTime(),
        updateTime: 0
      } as IData)
      .write()

    this.selectedNodeId = newId;
    this.reloadPassbook();
    this.reloadSelectedNodeData();
  }

  @action
  public editNode(title: string, data: IFormPair[]) {
    // 更新节点列表中的title
    this.PassbookDB
      .get('root')
      .find({ id: this.editNodeId })
      .assign({ title })
      .write()

    // 更新节点存储信息
    this.PassbookDB
      .get(`data.${this.editNodeId}`)
      .set('title', title)
      .set('data', data)
      .set('updateTime', new Date().getTime())
      .write()

    this.reloadPassbook()
    this.reloadSelectedNodeData()
  }

  @action
  public toggleAddFolderFormVisibled() {
    this.addFolderFormVisibled = !this.addFolderFormVisibled;
  }

  @action
  public toggleAddNodeFormVisibled() {
    this.addNodeFormVisibled = !this.addNodeFormVisibled
  }

  @action
  public updateSelectedNodeIdValue(id: string) {
    // 如果是没选中任何节点的状态下 默认在root下创建
    this.selectedNodeId = id === undefined ? 'root' : id;
    this.reloadSelectedNodeData()
  }

  @action
  public search(searchKey: string) {
    this.searchKey = searchKey;
    if (searchKey === '') {
      this.expandedKeys = []
      return
    }
    // 从节点集中寻找title包含searchKey的节点，然后返回id集合
    // 应为树选择器使用id作为节点的key，所以树选择器会主动展开含id的节点
    this.expandedKeys = toJS(this.PassbookDB.get('root').value())
      .filter((n: INode) => n.title.indexOf(searchKey) !== -1)
      .map((v: INode, _: number) => v.id)
  }

  @action
  public setExpandedKeys(expKeys: string[]) {
    this.expandedKeys = expKeys;
  }

  @action
  public toggleDelFormVisibled() {
    this.delNodeFormVisibled = !this.delNodeFormVisibled;
  }

  @action
  public deleteCurrentNode() {
    const delKeys = [this.deleteNodeId] as string[]
    const searchNodeChildKeys = (nodeKey: string) => {
      // 搜索该节点下是否有子节点 没有跳出递归
      const nodes = this.searchNodeChilds(nodeKey)
      if (nodes.length === 0) {
        return
      }
      // 有的话 先将子节点的id记录
      nodes.map((v, _) => delKeys.push(v.id))
      // 递归检查子节点
      nodes.map((v, _) => searchNodeChildKeys(v.id))
    }
    searchNodeChildKeys(this.deleteNodeId)
    delKeys.map((v, _) => this.delNode(v))
    this.selectedNodeData = []
    this.reloadPassbook()
  }

  @action
  public setSelectedNodeId(id: string) {
    this.selectedNodeId = id;
  }

  @action
  public toggleEditNodeFormVisibled() {
    this.editNodeFormVisibled = !this.editNodeFormVisibled;
  }

  private searchNode(id: string): INode {
    return toJS(this.PassbookDB.get('root').find({ id }).value())
  }

  private searchNodeChilds(pid: string): INode[] {
    return toJS(this.PassbookDB.get('root').filter({ pid }).value())
  }

  private getData(id: string): IData {
    return toJS(this.PassbookDB.get('data').get(id).value())
  }

  private delNode(id: string) {
    this.PassbookDB.get('root').remove({ id }).write()
    this.PassbookDB.unset(`data.${id}`).write()
  }

  @action
  private reloadSelectedNodeData() {
    const selectNode: INode = this.searchNode(this.selectedNodeId)
    // 如果是Node 则返回单个Data
    if (selectNode.type === NodeType.Node) {
      const node: IData = this.getData(selectNode.id)
      this.selectedNodeData = [node] as IData[]
      return
    }

    // 是Folder的情况下，递归搜索所有子节点的 返回节点集合
    const findNode = (seedNode: INode, nodeArr: IData[]) => {
      const childNodes = this.searchNode(seedNode.id)
      if (seedNode.type === NodeType.Node) {
        nodeArr.push(this.getData(childNodes.id))
        return
      }
      this.searchNodeChilds(childNodes.id).map((v: INode, _: number) => {
        findNode(v, nodeArr)
      })
    }

    const nodes = [] as IData[]
    findNode(selectNode, nodes)
    // 按照每项的更新时间及创建时间排序 更新时间优先于创建时间
    this.selectedNodeData = nodes
      .sort((a: IData, b: IData) => {
        // 两者都有updateTime 根据updateTime判断顺序
        if (a.updateTime !== 0 && b.updateTime !== 0) {
          return b.updateTime - a.updateTime
        }

        // 前者有updateTime 后者没有
        if (a.updateTime !== 0 && b.updateTime === 0) {
          return b.updateTime - a.createTime
        }

        // 前者没有updateTime 后者有
        if (a.updateTime === 0 && b.updateTime !== 0) {
          return b.createTime - a.updateTime
        }

        // 两者都没有updateTime
        return b.createTime - a.createTime
      })
  }

  @action
  private reloadPassbook() {
    this.passbook = this.PassbookDB.get('root').value();
  }

}

export default new PassbookStore();