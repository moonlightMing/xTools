import { Button, Form, Input, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { SettingStore } from 'src/store/SettingStore';
import FormWrapper from '../../FormWrapper';

interface IResetPasswordForm extends FormComponentProps {
  equalsOldPassword: (pwd: string) => boolean
  resetPassword: (pwd: string) => void
}

const ResetPasswordForm = Form.create<IResetPasswordForm>({ name: 'ResetPasswordForm' })(
  class extends React.Component<IResetPasswordForm, any> {

    public render() {

      const { getFieldDecorator, getFieldValue } = this.props.form;

      return (
        <FormWrapper title="密码重置" onSubmit={this.handleSubmit}>
          <Form.Item>
            {getFieldDecorator('oldPassword', {
              rules: [
                {
                  required: true,
                  message: '请输入旧密码!',
                }
              ],
            })(
              <Input
                type="password"
                placeholder="旧密码"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请输入新密码!',
                },
              ],
            })(
              <Input
                type="password"
                placeholder="输入新密码"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: '请再次输入新密码!',
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
                placeholder="再次输入新密码"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" htmlType="submit" block={true}
            >
              重置密码
            </Button>
          </Form.Item>
        </FormWrapper>
      )
    }

    private handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      this.props.form.validateFields((
        err: Error,
        values: { oldPassword: string, password: string, confirm: string }
      ) => {
        if (!err) {
          if (this.props.equalsOldPassword(values.oldPassword)) {
            this.props.resetPassword(values.password)
            message.success('密码重置成功！')
          } else {
            message.error('旧密码错误！')
          }
        }
      });
    }
  }
)

interface IResetPasswordFormProps extends React.Props<React.FC> {
  SettingStore: SettingStore
}

const ResetPasswordFormWrapper: React.FC = (props: IResetPasswordFormProps) => {

  const resetPassword = (pwd: string) => {
    props.SettingStore.setCurAuthPassword(pwd)
  }

  const equalsOldPassword = (pwd: string) => {
    return pwd === props.SettingStore.CurAuthPassword;
  }

  return (
    <ResetPasswordForm
      resetPassword={resetPassword}
      equalsOldPassword={equalsOldPassword}
    />
  )
}

export default inject('SettingStore')(observer(ResetPasswordFormWrapper));