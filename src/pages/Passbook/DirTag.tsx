import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';

interface IDirTagProps extends React.Props<React.FC> {
  PassbookStore: PassbookStore
}

const DirTag: React.FC = (props: IDirTagProps) => {
  return (
    <span
      className="py-1 px-2 position-absolute bg-light border-top border-right"
      style={
        props.PassbookStore.dirTagVisibleValue
          ? {
            left: '0px',
            bottom: '0px'
          }
          : {
            left: '0px',
            bottom: '0px',
            display: 'none'
          }
      }
    >
      当前路径: {
        `/ ${props.PassbookStore.selectedNodePathValue.join(' / ')}`
      }
    </span>
  )
}

export default inject('PassbookStore')(observer(DirTag));