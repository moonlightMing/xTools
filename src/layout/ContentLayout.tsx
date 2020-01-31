import React from 'react';

interface IContentLayoutProps extends React.PropsWithChildren<{ children?: React.ReactNode }> {
  className?: string
  style?: any
}

const ContentLayout = (props: IContentLayoutProps) => {
  let clsName = "container-fluid px-0 mx-0 bg-light d-flex justify-content-center h-100 w-100 overflow-auto"
  if (props.className) {
    clsName = clsName + " " + props.className
  }
  return (
    <div className={clsName} style={props.style}>
      {props.children}
    </div>
  )
}

export default ContentLayout;