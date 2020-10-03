import { inject, observer } from 'mobx-react';
import React from 'react';
import { SettingStore } from 'src/store/SettingStore';
import InitPasswordForm from './InitPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

interface IPasswordFormProps extends React.Props<React.FC> {
  SettingStore: SettingStore
}

const PasswordForm: React.FC = (props: IPasswordFormProps) => {
  if (!props.SettingStore.EnableAuthCheck) {
    return null
  }

  if (props.SettingStore.CurAuthPassword === '') {
    return <InitPasswordForm />
  } else {
    return <ResetPasswordForm />
  }
}

export default inject('SettingStore')(observer(PasswordForm));