import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';
import { IFormPair } from 'src/store/PassbookStore/type';
import { SettingStore } from 'src/store/SettingStore';
import NodeFormModal from './NodeFormModal';

const { ipcRenderer } = window.require('electron');

interface IEditNodeFormModal extends React.Props<React.FC> {
  PassbookStore: PassbookStore
  SettingStore: SettingStore
}

const EditNodeFormModal: React.FC = (props: IEditNodeFormModal) => {

  const onOk = (title: string, formValue: IFormPair[]) => {
    props.PassbookStore.toggleEditNodeFormVisibled()
    props.PassbookStore.editNode(title, formValue)

    // 云同步
    if (props.SettingStore.AutoAsync) {
      ipcRenderer.send('request-upload-store', 'passbook')
    }
  }

  const onCancal = () => {
    props.PassbookStore.toggleEditNodeFormVisibled()
  }

  return (
    // 表格数据内部使用了hook 每次修改初始值需要重新渲染
    props.PassbookStore.editNodeFormVisibledValue
      ?
      <NodeFormModal
        visibled={true}
        title="修改密码项"
        okText="修改"
        cancelText="取消"
        onOk={onOk}
        onCancal={onCancal}
        defaultTitle={props.PassbookStore.editNodeDataValue.title}
        defaultData={props.PassbookStore.editNodeDataValue.data}
      />
      :
      null
  )
}

export default inject('PassbookStore', 'SettingStore')(observer(EditNodeFormModal));