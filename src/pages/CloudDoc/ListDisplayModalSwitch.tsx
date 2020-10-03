import { Dropdown, Icon, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { inject, observer } from 'mobx-react';
import React from 'react';

import { CloudDocStore } from 'src/store/CloudDocStore';
import { IDocListDisplayType, IDocListSortDirection, IDocListSortType } from 'src/store/CloudDocStore/type';

interface IListDisplayModalSwitchProps extends React.Props<React.FC> {
  CloudDocStore: CloudDocStore
}

const displayMenuItem = (
  title: string,
  key: string,
  currentKey: string,
) => (
    <Menu.Item key={`type.${key}`} className="container-fluid row px-0">
      <span className="col-3 px-0 pl-2">
        {
          key === currentKey
            ?
            <Icon type="check" />
            :
            null
        }
      </span>
      <span className="col-9 px-0 ">
        {title}
      </span>
    </Menu.Item>
  )

const sortMenuItem = (
  title: string,
  key: string,
  currentKey: string,
  direction: IDocListSortDirection
) => (
    <Menu.Item key={`sort.${key}`} className="container-fluid row px-0">
      <span className="col-3 px-0 pl-2">
        {
          key === currentKey
            ?
            direction === IDocListSortDirection.Asc
              ?
              <Icon type="arrow-up" />
              :
              <Icon type="arrow-down" />
            :
            null
        }
      </span>
      <span className="col-9 px-0 ">
        {title}
      </span>
    </Menu.Item>
  )

const ListDisplayModalSwitch: React.FC = (props: IListDisplayModalSwitchProps) => {

  const onMenuItemClock = (param: ClickParam) => {
    // key的组成为 ${类别}.${枚举key值}
    const [type, key] = param.key.split('.')
    if (type === 'type') {
      props.CloudDocStore.setDocListDisplayModal(key as IDocListDisplayType)
    } else if (type === 'sort') {
      props.CloudDocStore.setDocListSort(key as IDocListSortType)
    }
  }

  const menu = (
    <Menu onClick={onMenuItemClock} style={{ width: '105px' }}>
      {displayMenuItem(
        "摘要",
        IDocListDisplayType.Detail,
        props.CloudDocStore.DocListDisplayModal,
      )}
      {displayMenuItem(
        "列表",
        IDocListDisplayType.List,
        props.CloudDocStore.DocListDisplayModal,
      )}
      <Menu.Divider />
      {sortMenuItem(
        "创建时间",
        IDocListSortType.CreateTime,
        props.CloudDocStore.DocListSort.type,
        props.CloudDocStore.DocListSort.direction
      )}
      {sortMenuItem(
        "更新时间",
        IDocListSortType.UpdateTime,
        props.CloudDocStore.DocListSort.type,
        props.CloudDocStore.DocListSort.direction
      )}
    </Menu>
  )

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Icon
        type="unordered-list"
        className="icon p-2"
        style={{ fontSize: '18px' }}
      />
    </Dropdown>
  )
}

export default inject('CloudDocStore')(observer(ListDisplayModalSwitch));