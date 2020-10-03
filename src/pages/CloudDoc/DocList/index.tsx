import { Dropdown, List, message } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';

import { CloudDocStore } from 'src/store/CloudDocStore';
import { SettingStore } from 'src/store/SettingStore';

import { IDocListDisplayType } from 'src/store/CloudDocStore/type';

import ContextMenu from './ContextMenu';
import DetailDocItem from './DetailDocItem';
import ListDocItem from './ListDocItem';

import path from 'path';
import Crypto from 'src/util/Crypto';
import fileHelper from 'src/util/FileHelper';
import JsDOM from 'src/util/JsDOM';
import MD5 from 'src/util/MD5';
import uuidV1 from 'uuid/v1';

const { ipcRenderer } = window.require('electron');

interface IDocListProps extends React.Props<React.FC> {
  SettingStore: SettingStore
  CloudDocStore: CloudDocStore
}

const DocList: React.FC = (props: IDocListProps) => {
  const renderItem =
    props.CloudDocStore.DocListDisplayModal === IDocListDisplayType.List
      ? ListDocItem
      : DetailDocItem

  const addTempFolder = () => {
    props.CloudDocStore.createTempFolder()
  }

  const addNewDoc = () => {
    props.CloudDocStore.createNewDoc();
  }

  const addExistDoc = async (absPaths: string[]) => {
    const sucFileList: Array<{ key: string, path: string, md5: string }> = [];
    Promise.all(
      absPaths.map((absPath: string) => {
        const encodeText = Crypto.encrypt(
          fileHelper.readFileSync(absPath)
        )
        const fileMD5 = MD5.strToMD5(encodeText)
        const fileName = path.basename(
          absPath.replace(/\\/g, "//"),
          path.extname(absPath)
        )

        // 如果已存在则不导入
        if (props.CloudDocStore.hasDocInCurFolder(fileMD5)) {
          message.warn(`${fileName} 已存在！`)
          return
        }

        const uuid = uuidV1();

        return fileHelper.writeFile(
          fileHelper.docStorePath(uuid),
          encodeText
        ).then(() => {
          const fileContent = fileHelper.readFileSync(absPath)
          // 导入成功写入lowdb入库
          props.CloudDocStore.importExistDoc(
            fileName,
            JsDOM.parsePreview(fileContent),
            uuid,
            fileMD5
          );
          sucFileList.push({ key: uuid, path: absPath, md5: fileMD5 })
        }).catch(() => {
          message.error(`${fileName} 导入失败！`)
        })
      })
    ).then(() => {
      props.CloudDocStore.flushDocList();
      if (props.SettingStore.AutoAsync) {
        ipcRenderer.send('request-upload-multiple-doc', sucFileList)
        ipcRenderer.send('request-upload-store', 'cloudoc')
      }
    })
  }

  return (
    <Dropdown
      overlay={ContextMenu({
        addNewDoc,
        addTempFolder,
        addExistDoc,
      })}
      overlayStyle={{ userSelect: 'none' }}
      trigger={['contextMenu']}
    >
      <List
        style={{
          bottom: '0px',
          overflow: 'auto',
          position: 'absolute',
          top: '45px',
          userSelect: 'none',
          width: '100%',
        }}
        dataSource={props.CloudDocStore.CurDocList}
        renderItem={renderItem}
      />
    </Dropdown>
  )
}

export default inject('SettingStore', 'CloudDocStore')(observer(DocList));