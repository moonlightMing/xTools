import { Form } from 'antd';
import React from 'react';

interface IFormWrapperProps extends React.PropsWithChildren<{}> {
  title: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
}

const FormWrapper = (props: IFormWrapperProps) => {
  return (
    <Form
      layout="horizontal"
      labelAlign="left"
      labelCol={{ span: 2 }}
      wrapperCol={{ span: 12 }}
      onSubmit={props.onSubmit}

    >
      <p
        className="font-weight-bold"
        style={{ fontSize: '16px' }}
      >
        {props.title}
      </p>
      <div className="ml-2">
        {props.children}
      </div>
    </Form >
  )
}

export default FormWrapper;