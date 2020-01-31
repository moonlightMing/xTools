import { Icon, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
const { remote } = window.require('electron');
import React from 'react';

interface IContextMenuProps {
  addNewDoc: () => void,
  addTempFolder: () => void,
  addExistDoc: (paths: string[]) => void,
}

const MenuItem = (
  key: string,
  title: string,
  icon: string,
) => (
    <Menu.Item key={key} className="row" style={{ verticalAlign: 'middle' }}>
      <span className="col-3 p-0">
        <Icon type={icon} />
      </span>
      <span className="col-9 p-0">
        {title}
      </span>
    </Menu.Item>
  )

const ContextMenu = (props: IContextMenuProps) => {
  const onClick = (param: ClickParam) => {
    switch (param.key) {
      /**
       * 添加空文档
       */
      case 'addDoc':
        // 文档创建可以先创建 后改名 不像文件夹必须先确定名称
        // 在文件内容确定前 不创建具体的文件
        props.addNewDoc()
        break;

      /**
       * 添加未命名的文件夹
       */
      case 'addFolder':
        props.addTempFolder()
        break;

      /**
       * 导入文档
       */
      case 'importDoc':
        remote.dialog.showOpenDialog({
          title: "选择导入的文件",
          filters: [
            // { extensions: ["*"], name: "Anything" },
            { extensions: ["md", "mdown", "markdown"], name: "Markdown files" },
            { extensions: ["txt", "textite"], name: "Text files" },
            { extensions: ["sql"], name: "DB files" },
            { extensions: ["ini", "conf", "json", "properties"], name: "Config files" }
          ],
          properties: ["openFile", "multiSelections"],
        }).then((result) => {
          if (!result.canceled) {
            props.addExistDoc(result.filePaths)
          }
        })
        break;
    }
  }

  return (
    <Menu onClick={onClick}>
      {MenuItem(
        "addDoc",
        "新建文档",
        "medium"
      )}
      {MenuItem(
        "addFolder",
        "新建文件夹",
        "folder"
      )}
      {MenuItem(
        "importDoc",
        "导入文档",
        "plus-square"
      )}
    </Menu>
  )
}

export default ContextMenu;