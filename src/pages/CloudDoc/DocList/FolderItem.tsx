import { Icon, Input } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Fragment, useState } from 'react';
import useHover from 'src/hook/useHover';
import { CloudDocStore } from 'src/store/CloudDocStore';
import { IFolder, IStatus } from 'src/store/CloudDocStore/type';

interface IFolderItemProps {
  data: IFolder
  CloudDocStore?: CloudDocStore
}

const FolderItem = (props: IFolderItemProps) => {

  const { data } = props;
  const [text, setText] = useState('')
  const [hover, onMouseEnter, onMouseLeave] = useHover()

  const onInputSubmit = () => {
    if (text === '') {
      props.CloudDocStore!.delTempFolder()
      return
    }
    const d = {
      id: props.data.id,
      pid: props.data.pid,
      name: text,
      status: IStatus.saved
    } as IFolder
    props.CloudDocStore!.createOrUpdateFolder(d)
  }

  const onEditIconClick = () => {
    props.CloudDocStore!.toggleItemRenameStatus(data.id)
  }

  const onDeleteIconClick = () => {
    props.CloudDocStore!.setCurDelId(data.id)
    props.CloudDocStore!.toggleDelModalVisibled()
  }

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setText(event.currentTarget.value)

  const input = (
    <Input
      size="small"
      style={{ width: '70%' }}
      defaultValue={data.name}
      autoFocus={true}
      placeholder={text}
      onChange={onInputChange}
      onPressEnter={onInputSubmit}
      onBlur={onInputSubmit}
    />
  )

  const btn = (
    <span className="float-right">
      <Icon
        type="edit"
        theme="filled"
        style={{ fontSize: '18px', marginRight: '5px' }}
        onClick={onEditIconClick}
      />
      <Icon
        type="delete"
        theme="filled"
        style={{ fontSize: '18px' }}
        onClick={onDeleteIconClick}
      />
    </span>
  )

  const folderName = (
    <Fragment>
      <span>
        {data.name}
      </span>
      {
        hover
          ? btn
          : null
      }
    </Fragment>
  )

  // 进入目录
  const onDoubleClick = () => {
    props.CloudDocStore!.enterFolder(props.data.id)
  }

  return (
    <div
      className="w-100 p-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
    >
      <Icon
        type="folder"
        theme="twoTone"
        className="p-0"
        style={{ fontSize: '18px', marginRight: '10px' }}
      />
      {
        props.data.status === IStatus.rename
          ? input
          : folderName
      }
    </div>
  )
}

export default inject('CloudDocStore')(observer(FolderItem));