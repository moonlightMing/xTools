import { Form, Input, message, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import { PassbookStore } from 'src/store/PassbookStore';
import { SettingStore } from 'src/store/SettingStore';

const { ipcRenderer } = window.require('electron');

interface IAddFolderFormModalProps extends React.PropsWithChildren<React.SFC> {
  PassbookStore: PassbookStore
  SettingStore: SettingStore
}

const AddFolderFormModal: React.SFC = (props: IAddFolderFormModalProps) => {

  const [inputValue, setInputValue] = useState('')

  const onCancal = () => {
    props.PassbookStore.toggleAddFolderFormVisibled()
    setInputValue('')
  }

  const onCreate = () => {
    // 输入值为空则警告
    if (inputValue === '') {
      message.warning('名称不能为空')
      return
    }
    props.PassbookStore.addFolder(inputValue)
    onCancal()

    // 云同步
    if (props.SettingStore.AutoAsync) {
      ipcRenderer.send('request-upload-store', 'passbook')
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <Modal
      visible={props.PassbookStore.addFolderFormVisibledValue}
      title="添加文件夹"
      okText="创建"
      cancelText="取消"
      onCancel={onCancal}
      onOk={onCreate}
    >
      <Form
        layout="vertical"
      >
        <Form.Item label="输入新目录名称">
          <Input value={inputValue} onChange={onChange} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default inject('PassbookStore', 'SettingStore')(observer(AddFolderFormModal));