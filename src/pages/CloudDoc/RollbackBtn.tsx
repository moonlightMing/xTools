import { Dropdown, Icon, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { CloudDocStore } from 'src/store/CloudDocStore';

interface IRollbackBtn extends React.Props<React.SFC> {
  CloudDocStore: CloudDocStore
}

const RollbackBtn: React.SFC = (props: IRollbackBtn) => {

  const onIconClick = () => {
    props.CloudDocStore.rollbackToLastFolder()
  }

  const onMenuItemClock = (_: ClickParam) => {
    props.CloudDocStore.backToRoot()
  }

  const menu = (
    <Menu onClick={onMenuItemClock} style={{ width: '105px' }}>
      <Menu.Item key="backToRoot">
        返回根目录
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} trigger={['contextMenu']}>
      <Icon
        type="enter"
        rotate={90}
        className="icon p-2"
        style={{ fontSize: '18px' }}
        onClick={onIconClick}
      />
    </Dropdown>
  )
}

export default inject('CloudDocStore')(observer(RollbackBtn));