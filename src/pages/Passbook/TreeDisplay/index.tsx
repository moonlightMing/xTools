import { Tree } from 'antd';
import { AntTreeNodeExpandedEvent, AntTreeNodeMouseEvent, AntTreeNodeSelectedEvent } from 'antd/lib/tree/Tree';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';
import { INode, NodeType } from 'src/store/PassbookStore/type';
import './index.scss';

const { TreeNode, DirectoryTree } = Tree;

interface ITreeDisplayProps extends React.PropsWithChildren<React.SFC> {
  PassbookStore: PassbookStore,
}

const inSearch = (title: string, searchKey: string) => {
  const index = title.indexOf(searchKey)
  if (index !== -1) {
    const beforeStr = title.substr(0, index)
    const afterStr = title.substr(index + searchKey.length)
    return (
      <span>
        {beforeStr}
        <span style={{ color: '#f50' }}>{searchKey}</span>
        {afterStr}
      </span>
    )
  }
  return <span>{title}</span>
}

const TreeDisplay: React.SFC = (props: ITreeDisplayProps) => {

  const searchKey = props.PassbookStore.searchKeyValue;

  const onSelect = (selectedKeys: string[], _: AntTreeNodeSelectedEvent) => {
    const selectedKey = selectedKeys[0]
    if (props.PassbookStore.selectedNodeIdValue === selectedKey) {
      return
    }
    props.PassbookStore.updateSelectedNodeIdValue(selectedKey)
  }

  const onExpand = (expKeys: string[], _: AntTreeNodeExpandedEvent) => {
    props.PassbookStore.setExpandedKeys(expKeys)
  }

  const treeLoop = (nodes: INode[], pid = "root") => {
    const childNodes = nodes?.filter((n) => n.pid === pid)
    return !childNodes
      ? null
      : childNodes
        .map((v, _) => {
          // 如果在搜索 则对符合条件的title标红
          const title = searchKey === '' ? v.title : inSearch(v.title, searchKey)
          if (v.type === NodeType.Node) {
            return <TreeNode key={v.id} title={title} isLeaf={true} />
          } else {
            return (
              <TreeNode key={v.id} title={title}>
                {treeLoop(nodes, v.id)}
              </TreeNode>
            )
          }
        })
  }

  const onRightClick = (options: AntTreeNodeMouseEvent) => {
    props.PassbookStore.setDeleteNodeId(options.node.props.eventKey!)
    props.PassbookStore.toggleDelFormVisibled()
  }

  const onBlankClick = () => {
    props.PassbookStore.setSelectedNodeId('root')
    props.PassbookStore.setExpandedKeys([])
  }

  return (
    <div
      className="absHeight d-flex align-items-start flex-column"
    >
      <DirectoryTree
        className="w-100"
        onSelect={onSelect}
        showIcon={true}
        expandAction='click'
        expandedKeys={props.PassbookStore.expandedKeysValue}
        autoExpandParent={props.PassbookStore.autoExpandParentValue}
        onExpand={onExpand}
        onRightClick={onRightClick}
        blockNode={true}
      >
        {treeLoop(props.PassbookStore.passbookValue)}
      </DirectoryTree>

      {/* 下方空白区域 点击则当前目录变为root */}
      <div
        className="w-100 flex-grow-1"
        style={{ minHeight: '50px' }}
        onClick={onBlankClick}
      />
    </div>
  )
}

export default inject('PassbookStore')(observer(TreeDisplay));