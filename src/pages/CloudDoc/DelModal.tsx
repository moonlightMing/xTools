import { message, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { CloudDocStore } from 'src/store/CloudDocStore';
import { IDoc } from 'src/store/CloudDocStore/type';
import { SettingStore } from 'src/store/SettingStore';
import fileHelper from 'src/util/FileHelper';

const { ipcRenderer } = window.require('electron');

interface IDelModalProps extends React.Props<React.SFC> {
  CloudDocStore: CloudDocStore
  SettingStore: SettingStore
}

const DelModal: React.SFC = (props: IDelModalProps) => {

  const onOk = () => {

    props.CloudDocStore.toggleDelModalVisibled()
    // 删除 -> 关闭对话框 -> 删除激活目录中的该项（如果有） -> 刷新左侧目录列表 -> 提示信息

    // 删除lowdb中关于该节点的数据 如果为数组则返回其下所有文档的存储路径
    const willRemoveDocList: IDoc[] | undefined = props.CloudDocStore.delItem(
      props.CloudDocStore.CurDelId
    )

    // 删除文档数据
    if (willRemoveDocList) {
      willRemoveDocList.map((v: IDoc) => {
        // 删除本地文件
        fileHelper.deleteFile(
          fileHelper.docStorePath(v.relativePath)
        )

        // 删除激活列表中的Doc
        props.CloudDocStore.delOpenDoc(v.id)
      })
    }

    props.CloudDocStore.flushDocList()
    message.success('目标已删除！')

    if (props.SettingStore.AutoAsync) {
      ipcRenderer.send('request-upload-store', 'cloudoc')
      ipcRenderer.send(
        'request-delete-doc',
        willRemoveDocList!.map((d: IDoc): string => `cloudocStore/${d.relativePath}`)
      )
    }
  }

  const onCancel = () => {
    props.CloudDocStore.toggleDelModalVisibled();
  }

  return (
    <Modal
      visible={props.CloudDocStore.DelModalVisibled}
      onOk={onOk}
      onCancel={onCancel}
    >
      <p>
        <span>确认删除</span>
        <span className="mx-1 font-weight-bolder">{props.CloudDocStore.CurDelTitle}</span>
        <span>吗?</span>
      </p>
      <span>如果为文件夹则将删除目录下所有内容</span>
    </Modal >
  )
}

export default inject('CloudDocStore', 'SettingStore')(observer(DelModal));