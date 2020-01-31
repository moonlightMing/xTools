import { message } from 'antd';
import { IpcRendererEvent } from 'electron';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { Fragment, useState } from 'react';
import useIpcRenderer from 'src/hook/useIpcRenderer';
import { CloudDocStore } from 'src/store/CloudDocStore';
import { IDoc, IStatus } from 'src/store/CloudDocStore/type';
import { SettingStore } from 'src/store/SettingStore';
import Crypto from 'src/util/Crypto';
import JsDOM from 'src/util/JsDOM';
import MD5 from 'src/util/MD5';

const fs = window.require('fs');
const { ipcRenderer } = window.require('electron');

// Markdown编辑器
import { Editor, KeyMap } from 'codemirror';
import 'codemirror/keymap/sublime';
import "easymde/dist/easymde.min.css";
import SimpleMDE from 'react-simplemde-editor';
import fileHelper from 'src/util/FileHelper';

// 持久化文档到磁盘
const saveCurrentFile = (doc: IDoc, value: string): Promise<any> => {
  const savePath = fileHelper.docStorePath(doc.relativePath)
  return fileHelper.writeFile(savePath, Crypto.encrypt(value))
}

// 同步读取文档
const readDocFile = (doc: IDoc): string => {
  const docStorePath = fileHelper.docStorePath(doc.relativePath)
  if (!fs.existsSync(docStorePath)) {
    return doc.preview
  }
  return Crypto.decrypt(fileHelper.readFileSync(docStorePath))
}

interface IEditorProps {
  doc: IDoc
  CloudDocStore?: CloudDocStore
  SettingStore?: SettingStore
}

const Editor = (props: IEditorProps) => {

  const { doc } = props;
  const [lastSyncDate, setLastSyncDate] = useState('')

  const extraKeys: KeyMap = {
    // Save
    "Ctrl-S": (editor: Editor) => {
      if (doc.status === IStatus.saved) {
        return
      }
      const value = editor.getValue()
      const md5 = MD5.strToMD5(value)
      // 更新本地存储
      saveCurrentFile(doc, value)
        .then(() => {
          // 更新lowdb
          props.CloudDocStore!.updateDoc(doc.id, {
            status: IStatus.saved,
            preview: JsDOM.parsePreview(value) as string,
            updateTime: new Date().getTime(),
            md5,
          } as IDoc)
          props.CloudDocStore!.flushDocList();
          props.CloudDocStore!.flushOpenDocList();
          // 自动同步至云端
          if (props.SettingStore!.AutoAsync) {
            ipcRenderer.send('request-upload-doc', {
              id: doc.id,
              key: `cloudocStore/${doc.relativePath}`,
              path: fileHelper.docStorePath(doc.relativePath),
              md5
            })
            ipcRenderer.send('request-upload-store', 'cloudoc')
          }
        }).catch(() => {
          message.error('文件保存失败！')
        })
    },
    "Ctrl-W": (_: Editor) => {
      props.CloudDocStore!.delOpenDoc(
        props.CloudDocStore!.OpenDocListActiveKey
      )
    }
  }

  useIpcRenderer({
    // 文件云同步后的回调
    "request-upload-doc-reply": (
      _: IpcRendererEvent,
      args: { docId: string, syncDate: string }
    ) => {
      if (args.docId === doc.id) {
        setLastSyncDate(moment(args.syncDate).format('HH:mm:ss'))
      }
    }
  })

  const getMdeInstance = (instance: any) => {

    // 初始化时 键位表替换为Sublime风格
    instance.codemirror.setOption('keyMap', 'sublime');

    // 合并自定义按键操作
    instance.codemirror.options.extraKeys = Object.assign(
      instance.codemirror.options.extraKeys,
      extraKeys
    )

    /**
     * 改写togglePreview按钮的动作 将文档预览状态添加至lowdb
     * 11是togglePreview在工具栏数组中的下标
     */
    instance.toolbar[11].action = (_: Editor) => {
      props.CloudDocStore!.updateDoc(doc.id, {
        previewMode: !doc.previewMode
      } as IDoc)
      instance.togglePreview()
    }

    // 文档为预览模式时 触发预览
    if (doc.previewMode) {
      instance.togglePreview()
    }
  }

  const onChange = (value: string) => {
    /**
     * 一旦内容有所变动 状态变为编辑中
     */
    if (doc.status === IStatus.saved && MD5.strToMD5(value) !== doc.md5) {
      props.CloudDocStore!.updateDoc(doc.id, {
        status: IStatus.edit
      } as IDoc)
      props.CloudDocStore!.flushOpenDocList()

      /**
       * 编辑过但是内容与保存时一致 状态变为已保存
       */
    } else if (doc.status === IStatus.edit && MD5.strToMD5(value) === doc.md5) {
      props.CloudDocStore!.updateDoc(doc.id, {
        status: IStatus.saved
      } as IDoc)
      props.CloudDocStore!.flushOpenDocList()
    }
  }

  return (
    <Fragment>
      <SimpleMDE
        key={doc.id}
        className="h-100"
        value={readDocFile(doc)}
        onChange={onChange}
        getMdeInstance={getMdeInstance}
        options={{
          autoDownloadFontAwesome: true,
          autofocus: true,
          spellChecker: false,
          renderingConfig: {
            singleLineBreaks: true,
            codeSyntaxHighlighting: true,
          },
        }}
      />
      {
        lastSyncDate.length !== 0
          ?
          <span className="sync-status">
            已同步，上次同步时间 {lastSyncDate}
          </span>
          :
          null
      }
    </Fragment>
  )
}

export default inject('CloudDocStore', 'SettingStore')(observer(Editor));