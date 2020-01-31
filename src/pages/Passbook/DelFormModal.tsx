import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';
import { SettingStore } from 'src/store/SettingStore';

const { ipcRenderer } = window.require('electron');

interface IDelFormModalProps extends React.Props<React.SFC> {
  PassbookStore: PassbookStore
  SettingStore: SettingStore
}

const DelFormModal: React.SFC = (props: IDelFormModalProps) => {

  const onCancel = () => {
    props.PassbookStore.toggleDelFormVisibled()
  }

  const onDelete = () => {
    props.PassbookStore.toggleDelFormVisibled()
    props.PassbookStore.deleteCurrentNode()
    // 云同步
    if (props.SettingStore.AutoAsync) {
      ipcRenderer.send('request-upload-store', 'passbook')
    }
  }

  return (
    <Modal
      title="删除确认"
      okText="Delete"
      onOk={onDelete}
      onCancel={onCancel}
      visible={props.PassbookStore.delNodeFormVisibledValue}
    >
      <span>确认删除</span>
      <span className="font-weight-bold mx-1">{props.PassbookStore.delFormTitleValue}</span>
      <span>吗？</span>
    </Modal>
  )

}

export default inject('PassbookStore', 'SettingStore')(observer(DelFormModal));