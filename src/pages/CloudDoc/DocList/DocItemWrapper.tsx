import { List } from 'antd';
import React from 'react';
import useHover from 'src/hook/useHover';

interface IDocItemWrapperProps extends React.PropsWithChildren<{ children?: React.ReactNode }> {
  key?: string | number | undefined
}

const DocItemWrapper = (props: IDocItemWrapperProps) => {
  const [hover, onMouseEnter, onMouseLeave] = useHover();

  return (
    <List.Item
      key={props.key}
      className="p-0"
      style={
        hover
          ? { background: '#ccc' }
          : {}
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {props.children}
    </List.Item>
  )
}

export default DocItemWrapper;