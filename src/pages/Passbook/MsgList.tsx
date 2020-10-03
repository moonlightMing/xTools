import { Empty, List } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';
import { IData } from 'src/store/PassbookStore/type';
import MsgCard from './MsgCard';

interface IMsgListProps extends React.PropsWithChildren<React.FC> {
  PassbookStore: PassbookStore
}

const MsgList: React.FC = (props: IMsgListProps) => {
  // 如果没有内容返回空状态
  if (props.PassbookStore.selectedNodeDataValue.length === 0) {
    return <Empty className="align-self-center" />
  }

  const onEditMsg = (id: string) => {
    props.PassbookStore.setEditNodeId(id)
    props.PassbookStore.toggleEditNodeFormVisibled()
  }

  const renderItem = (nodeData: IData, index: number) => (
    <MsgCard key={index} nodeData={nodeData} onEditMsg={onEditMsg} />
  )

  return (
    <List
      bordered={false}
      dataSource={props.PassbookStore.selectedNodeDataValue}
      renderItem={renderItem}
      className="col-8 my-3"
    />
  )
}

export default inject('PassbookStore')(observer(MsgList));