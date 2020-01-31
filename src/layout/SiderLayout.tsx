import React from 'react';

interface ISiderLayoutProps {
  sider: React.SFC | React.ComponentClass | JSX.Element
  content: React.SFC | React.ComponentClass | JSX.Element
}

const SiderLayout = (props: ISiderLayoutProps) => {
  return (
    <div className="container-fluid row px-0 mx-0 h-100">
      <div
        className="col-xl-3 col-lg-3 col-md-4 col-sm-5 bg-light px-0 h-100"
      >
        {props.sider}
      </div>
      <div
        className="col-xl-9 col-lg-9 col-md-8 col-sm-7 bg-dark p-0"
      >
        {props.content}
      </div>
    </div >
  )
}

export default SiderLayout;