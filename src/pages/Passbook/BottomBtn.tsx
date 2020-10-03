import { Icon } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';
import { NodeType } from 'src/store/PassbookStore/type';

interface IBottomBtnProps extends React.PropsWithChildren<React.FC> {
  PassbookStore: PassbookStore
}

const BottomBtn: React.FC = (props: IBottomBtnProps) => {

  // 如果当前节点为数据Node 则不可创建文件夹和文件
  const disabled = props.PassbookStore.selectedNodeTypeValue === NodeType.Node;

  const onAddFolderBtnClock = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled) { return }
    props.PassbookStore.toggleAddFolderFormVisibled()
  }

  const onAddMessageBtnClock = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled) { return }
    props.PassbookStore.toggleAddNodeFormVisibled()
  }

  return (
    <div
      className="container-fluid row px-0 mx-0 no-gutters h-auto"
      style={{ position: 'absolute', bottom: '-1px' }}
    >
      <button
        type="button"
        className={
          disabled
            ? "btn btn-primary col disabled"
            : "btn btn-primary col"
        }
        style={{ borderRadius: '0' }}
        onClick={onAddFolderBtnClock}
      >
        <Icon
          type="folder-add"
          className="mr-1"
          theme="filled"
          style={{ fontSize: '13px' }}
        />
        添加文件夹
      </button>
      <button
        type="button"
        className={
          disabled
            ? "btn btn-success col disabled"
            : "btn btn-success col"
        }
        style={{ borderRadius: '0' }}
        onClick={onAddMessageBtnClock}
      >
        <Icon
          type="file-add"
          className="mr-1"
          style={{ fontSize: '13px' }}
          theme="filled"
        />
        添加项目
      </button>
    </div>
  )
}

export default inject('PassbookStore')(observer(BottomBtn));