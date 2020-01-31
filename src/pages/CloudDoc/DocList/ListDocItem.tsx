import { Icon, Input, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import useHover from 'src/hook/useHover';
import { CloudDocStore } from 'src/store/CloudDocStore';
import { IDoc, IFolder, IStatus } from 'src/store/CloudDocStore/type';
import fileHelper from 'src/util/FileHelper';
import MD5 from 'src/util/MD5';
import DocItemWrapper from './DocItemWrapper';
import FolderItem from './FolderItem';

interface IDocItemProps {
  data: IDoc
  CloudDocStore?: CloudDocStore
}

const searchKeyHighlight = (title: string, searchKey: string) => {
  // 未在搜索模式 直接返回
  if (searchKey === '') {
    return <span>{title}</span>
  }
  const index = title.indexOf(searchKey)
  // 搜索关键字不在标题中 直接返回
  if (index === -1) {
    return <span>{title}</span>
  }

  const beforeStr = title.substr(0, index)
  const afterStr = title.substr(index + searchKey.length)
  return (
    <span>
      {beforeStr}
      <span style={{ color: '#f50' }}>{searchKey}</span>
      {afterStr}
    </span>
  )
}

const DocItem = inject('CloudDocStore')(observer((props: IDocItemProps) => {
  const { data } = props;
  const [text, setText] = useState('')
  const [hover, onMouseEnter, onMouseLeave] = useHover()

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value)
  }

  const onInputSubmit = () => {
    if (text === '') {
      props.CloudDocStore!.toggleItemRenameStatus(data.id);
      return
    }

    props.CloudDocStore!.setDocTitle(data.id, text);
    props.CloudDocStore!.flushDocList();
    props.CloudDocStore!.flushOpenDocList();
  }

  const onItemDoubleClick = () => {
    if (props.CloudDocStore!.OpenDocListActiveKey === data.id) {
      return
    }
    // 如果文档本身是编辑状态 但是内容前后一致 则状态变更为已保存
    const fileMD5 = MD5.fileToMD5(
      fileHelper.docStorePath(data.relativePath)
    )
    if (data.status === IStatus.edit && fileMD5 === data.md5) {
      props.CloudDocStore!.updateDoc(data.id, {
        status: IStatus.saved
      } as IDoc)
    }
    props.CloudDocStore!.openDoc(data.id);
    props.CloudDocStore!.flushOpenDocList();
    props.CloudDocStore!.setOpenDocListActiveKey(data.id);
  }

  const onEditIconClick = () => {
    props.CloudDocStore!.toggleItemRenameStatus(data.id);
  }

  const onDeleteIconClick = () => {
    props.CloudDocStore!.setCurDelId(data.id);
    props.CloudDocStore!.toggleDelModalVisibled();
  }

  const input = (
    <Input
      size="small"
      defaultValue={data.title}
      autoFocus={true}
      placeholder={text}
      onChange={onInputChange}
      onPressEnter={onInputSubmit}
      onBlur={onInputSubmit}
    />
  )

  return (
    <div
      className="w-100 p-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onItemDoubleClick}
      style={
        props.CloudDocStore!.OpenDocListActiveKey === data.id
          ? { background: '#ccc' }
          : {}
      }
    >
      <Icon
        type="medium-square" theme="filled"
        style={{ fontSize: '18px', marginRight: '10px' }}
      />
      <Tooltip
        title={data.title}
        placement="rightTop"
        mouseEnterDelay={1}
        // 标题长度不足则不展示气泡
        overlayStyle={
          data.title.length > 9
            ? {}
            : { display: 'none' }
        }
      >
        <span
          className="text-truncate h-100"
          style={{
            display: 'inline-block',
            lineHeight: '100%',
            maxWidth: '140px',
            verticalAlign: 'middle',
          }}
        >
          {
            data.status === IStatus.rename
              ? input
              : searchKeyHighlight(data.title, props.CloudDocStore!.CurSearchKey)
          }
        </span>
      </Tooltip>
      <span
        className="float-right"
        style={
          hover
            ? {}
            : { display: 'none' }
        }
      >
        <Icon
          type="edit"
          style={{ fontSize: '18px', marginRight: '5px' }}
          onClick={onEditIconClick}
        />
        <Icon
          type="delete"
          style={{ fontSize: '18px' }}
          onClick={onDeleteIconClick}
        />
      </span>
    </div >
  )
}))

const ListDocItem = (item: IDoc | IFolder, _: number) => {

  if ((item as IDoc).title) {
    return (
      <DocItemWrapper key={item.id}>
        <DocItem data={item as IDoc} />
      </DocItemWrapper>
    )
  } else {
    return (
      <DocItemWrapper key={item.id}>
        <FolderItem data={item as IFolder} />
      </DocItemWrapper>
    )
  }

}

export default ListDocItem;