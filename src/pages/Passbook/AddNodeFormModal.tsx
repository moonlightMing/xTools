import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';
import { IFormPair } from 'src/store/PassbookStore/type';
import { SettingStore } from 'src/store/SettingStore';
import NodeFormModal from './NodeFormModal';

interface IAddNodeFormModal extends React.Props<React.FC> {
  PassbookStore: PassbookStore
  SettingStore: SettingStore
}

const AddNodeFormModal: React.FC = (props: IAddNodeFormModal) => {
  const onOk = (title: string, formValue: IFormPair[]) => {
    props.PassbookStore.toggleAddNodeFormVisibled()
    props.PassbookStore.addNode(title, formValue)
    // 云同步
    if (props.SettingStore.AutoAsync) {
      ipcRenderer.send('request-upload-store', 'passbook')
    }
  }

  const onCancal = () => {
    props.PassbookStore.toggleAddNodeFormVisibled()
  }

  return (
    <NodeFormModal
      visibled={props.PassbookStore.addNodeFormVisibledValue}
      title="添加密码项"
      okText="创建"
      cancelText="取消"
      onOk={onOk}
      onCancal={onCancal}
    />
  )
}

export default inject('PassbookStore', 'SettingStore')(observer(AddNodeFormModal));