import { Button, Form, Input, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { SettingStore } from 'src/store/SettingStore';
import FormWrapper from '../../FormWrapper';

interface IInitPasswordFormProps extends FormComponentProps {
  setInitPassword: (pwd: string) => void
}

const InitPasswordForm = Form.create<IInitPasswordFormProps>({ name: 'InitPasswordForm' })(
  class extends React.Component<IInitPasswordFormProps, any> {
    public render() {

      const { getFieldDecorator, getFieldValue } = this.props.form;

      return (
        <FormWrapper title="密码初始化" onSubmit={this.handleSubmit}>
          <p className="text-danger">
            密码为空时 验证功能不生效
          </p>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请输入初始密码!',
                },
              ],
            })(
              <Input
                type="password"
                placeholder="输入密码"
              />
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: '请再次输入密码!',
                },
                {
                  validator: (_, value, callback) => {
                    if (value && value !== getFieldValue('password')) {
                      callback('两次密码不一致！')
                    } else {
                      callback()
                    }
                  }
                }
              ],
            })(
              <Input
                type="password"
                placeholder="再次输入"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" htmlType="submit" block={true}
            >
              设置初始密码
            </Button>
          </Form.Item>
        </FormWrapper>
      )
    }

    private handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      this.props.form.validateFields((err: Error, values: { password: string, confirm: string }) => {
        if (!err) {
          this.props.setInitPassword(values.password)
          message.success('密码已初始化！')
        }
      });
    }
  }
)

interface IInitPasswordFormWrapperProps extends React.Props<React.SFC> {
  SettingStore: SettingStore
}

const InitPasswordFormWrapper: React.SFC = (props: IInitPasswordFormWrapperProps) => {

  const setInitPassword = (pwd: string) => {
    props.SettingStore.setCurAuthPassword(pwd)
  }

  return (
    <InitPasswordForm setInitPassword={setInitPassword} />
  )
}

export default inject('SettingStore')(observer(InitPasswordFormWrapper));