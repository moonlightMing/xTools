import { Empty, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import useIpcRenderer from 'src/hook/useIpcRenderer';
import { CloudDocStore } from 'src/store/CloudDocStore';
import { IDoc } from 'src/store/CloudDocStore/type';
import Editor from './Editor';
import './index.scss';
import TabTitle from './TabTitle';

const { TabPane } = Tabs;

interface IEditPageProps extends React.Props<React.SFC> {
  CloudDocStore: CloudDocStore
}

const EditPage: React.SFC = (props: IEditPageProps) => {

  useIpcRenderer({
    // 因为编辑器因BUG无法重载文本内容
    // 改为云端同步至本地后 清理打开的文档列表
    "reload-editor-content": () => {
      props.CloudDocStore.clearOpenDocList()
    }
  })

  const onTabChange = (activeKey: string) => {
    props.CloudDocStore.setOpenDocListActiveKey(activeKey)
  }

  const onEdit = (
    targetKey: string | React.MouseEvent<HTMLElement>,
    action: 'add' | 'remove'
  ) => {
    if (action === 'remove') {
      props.CloudDocStore.delOpenDoc((targetKey as string))
    }
  }

  if (props.CloudDocStore.OpenDocList.length === 0) {
    return <Empty className="align-self-center" />
  } else {
    return (
      <Tabs
        className="w-100 h-100"
        defaultActiveKey={props.CloudDocStore.OpenDocListActiveKey}
        activeKey={props.CloudDocStore.OpenDocListActiveKey}
        onChange={onTabChange}
        onEdit={onEdit}
        hideAdd={true}
        tabPosition="top"
        type="editable-card"
        tabBarStyle={{ marginBottom: '0px', paddingLeft: '3px' }}
      >
        {props.CloudDocStore.OpenDocList.map((d: IDoc, _: number) => (
          <TabPane
            tab={TabTitle(d)}
            key={d.id}
            closable={true}
          >
            <Editor doc={d} />
          </TabPane>
        ))}
      </Tabs>
    )
  }
}

export default inject('CloudDocStore')(observer(EditPage));