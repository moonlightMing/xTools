import { Icon, Input } from 'antd';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { useState } from "react"
import useHover from 'src/hook/useHover';
import { CloudDocStore } from 'src/store/CloudDocStore';
import { IDoc, IFolder, IStatus } from "src/store/CloudDocStore/type";
import fileHelper from 'src/util/FileHelper';
import MD5 from 'src/util/MD5';
import DocItemWrapper from './DocItemWrapper';
import FolderItem from './FolderItem';

const parseDate = (date: number) => {
  return moment(
    new Date(date)
  ).format('YYYY-MM-DD')
}

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
  // 更新日期优于创建日期显示
  const showDate =
    data.updateTime !== 0
      ? `更新于 ${parseDate(data.updateTime)}`
      : `创建于 ${parseDate(data.createTime)}`

  // 如果是临时状态 则标题变为可编辑状态
  const [text, setText] = useState(data.title);

  const [hover, onMouseEnter, onMouseLeave] = useHover();

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value);
  }

  const onInputSubmit = () => {
    if (text === '') {
      props.CloudDocStore!.toggleItemRenameStatus(data.id)
      return
    }

    props.CloudDocStore!.setDocTitle(data.id, text);
    props.CloudDocStore!.flushDocList();
    props.CloudDocStore!.flushOpenDocList();
  }

  const onEditIconClick = () => {
    props.CloudDocStore!.toggleItemRenameStatus(data.id);
  }

  const onDeleteIconClick = () => {
    props.CloudDocStore!.setCurDelId(data.id);
    props.CloudDocStore!.toggleDelModalVisibled();
  }

  const onItemDoubleClick = () => {
    if (props.CloudDocStore!.OpenDocListActiveKey === data.id) {
      return
    }
    // 如果文档本身是编辑状态 但是内容前后一致 则状态变更为已保存
    const fileMD5 = MD5.fileToMD5(
      fileHelper.docStorePath(data.relativePath)
    )
    if (fileMD5 === data.md5) {
      props.CloudDocStore!.updateDoc(data.id, {
        status: IStatus.saved
      } as IDoc)
    }
    // 打开文档
    props.CloudDocStore!.openDoc(data.id);
    props.CloudDocStore!.flushOpenDocList();
    props.CloudDocStore!.setOpenDocListActiveKey(data.id);
  }

  const input = (
    <Input
      size="small"
      style={{ width: '70%' }}
      defaultValue={data.title}
      autoFocus={true}
      placeholder={text}
      onChange={onInputChange}
      onPressEnter={onInputSubmit}
      onBlur={onInputSubmit}
    />
  )

  const itemTitle = (
    <span
      className="text-truncate "
      style={{
        display: 'inline-block',
        lineHeight: '100%',
        maxWidth: '160px',
        verticalAlign: 'middle',
      }}
    >
      {searchKeyHighlight(data.title, props.CloudDocStore!.CurSearchKey)}
    </span>
  )

  return (
    <div
      className="w-100 p-3 m-0"
      onDoubleClick={onItemDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={
        props.CloudDocStore!.OpenDocListActiveKey === data.id
          ? { background: '#ccc' }
          : {}
      }
    >
      <div className="font-weight-bolder">
        <Icon
          type="medium-square" theme="filled"
          style={{ fontSize: '16px', marginRight: '10px' }}
        />
        {
          data.status === IStatus.rename
            ? input
            : itemTitle
        }
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
            style={{ fontSize: '16px', marginRight: '5px' }}
            onClick={onEditIconClick}
          />
          <Icon
            type="delete"
            style={{ fontSize: '16px' }}
            onClick={onDeleteIconClick} />
        </span>
      </div>
      <div className="mt-1 my-1 pl-4 text-secondary"
        style={{
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          display: "-webkit-box",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {data.preview}
      </div>
      <div className="mt-2 text-black-50 pl-4">
        <span style={{ fontSize: '12px' }}>
          {showDate}
        </span>
      </div>
    </div>
  )
}))

const DetailDocItem = (item: IDoc | IFolder, _: number) => {

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

export default DetailDocItem;