import React from 'react';
import { IDoc, IStatus } from 'src/store/CloudDocStore/type';

const TabTitle = (doc: IDoc) => {
  // 标签前端展示文件保存状态的圆点
  const statusPoint = (
    <span
      className="d-inline-block rounded-circle mr-2"
      style={{
        height: '8px',
        width: '8px',
        background: doc.status === IStatus.saved ? '#00CC00' : '#FF3333',
      }}
    />
  )

  return (
    <span
      className="text-truncate "
      style={{
        display: 'inline-block',
        lineHeight: '100%',
        maxWidth: '160px',
        userSelect: 'none',
        verticalAlign: 'middle',
      }}
    >
      {statusPoint}
      {doc.title}
    </span>
  )
}

export default TabTitle;