import { Icon } from 'antd';
import React from 'react';
import useHover from 'src/hook/useHover';
import './HeadBtn.scss';

interface IHeadBtnProps {
  btnType: string,
  hoverColor: string,
  onClick: ((event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void)
}

const HeadBtn = (props: IHeadBtnProps) => {

  const [hover, onMouseEnter, onMouseLeave] = useHover()

  return (
    <div
      onClick={props.onClick}
      className="d-flex justify-content-center float-right px-3 head-btn h-100"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={
        hover
          ? { background: props.hoverColor }
          : {}
      }
    >
      <Icon className="align-self-center" type={props.btnType} />
    </div>
  )
}

export default HeadBtn;