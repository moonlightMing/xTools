import { Card, Icon, message } from 'antd';
import React, { Fragment } from 'react';
import { IData, IFormPair } from 'src/store/PassbookStore/type';
const { clipboard } = window.require('electron')
import moment from "moment";
import useHover from 'src/hook/useHover';
import './index.scss';

interface IMsgCardProps {
  key: number
  nodeData: IData
  onEditMsg: (id: string) => void
}

const MsgTitle = (nodeData: IData, isHover: boolean, onEditMsg: (id: string) => void) => {
  // 拷贝该项所有内容至剪贴板
  const copyMsgToClipboard = () => {
    let msg = `# ${nodeData.title}\n\n`
    msg = msg + nodeData.data.map((v, i) => {
      return `${v.key}: ${v.value}`
    }).join("\n")
    clipboard.writeText(msg)
    message.info('内容已复制到剪贴板')
  }

  // 触发编辑内容
  const editMsg = () => onEditMsg(nodeData.id)

  return (
    <Fragment>
      <span className="font-weight-bold"># {nodeData.title}</span>
      <span className={isHover ? "float-right" : "float-right fade"} >
        <Icon type="copy" className="mr-2" onClick={copyMsgToClipboard} />
        <Icon type="edit" onClick={editMsg} />
      </span>
    </Fragment>
  )
}

const MsgItems = (key: string, item: IFormPair) => {
  const onItemClick = () => {
    clipboard.writeText(item.value)
    message.info('内容已复制到剪贴板')
  }
  return (
    <p key={key} className="row">
      <span
        className="text-md-right col-3 px-2 font-weight-bold"
      >
        {item.key}:
      </span>
      <a
        className="text-md-left col-9 px-0 copy-key"
        onClick={onItemClick}
      >
        {item.value}
      </a>
    </p>
  )
}

const MsgFooter = (createTime: number, updateTime: number) => {
  const time: Date = updateTime !== 0 ? new Date(updateTime) : new Date(createTime)
  return (
    <span className="float-right text-black-50">
      {updateTime !== 0 ? "最近更新于：" : "创建于："}{moment(time).format('YYYY-MM-DD HH:mm:ss')}
    </span>
  )
}

const MsgCard = (props: IMsgCardProps) => {
  const { key, nodeData } = props;
  const [hover, onMouseEnter, onMouseLeave] = useHover();
  return (
    <Card
      key={key}
      title={MsgTitle(nodeData, hover, props.onEditMsg)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="my-2"
    >
      {nodeData.data.map((item: IFormPair, index: number) => MsgItems(`${key}-${index}`, item))}
      {MsgFooter(nodeData.createTime, nodeData.updateTime)}
    </Card>
  )
}

export default MsgCard;