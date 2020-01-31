import React, { Fragment } from 'react';
import AFKForm from './AFKForm';
import BaseForm from './BaseForm';
import PasswordForm from './PasswordForm';

const AuthTab = () => {
  return (
    <Fragment>
      <BaseForm />
      <AFKForm />
      <PasswordForm />
    </Fragment>
  )
}

export default AuthTab;