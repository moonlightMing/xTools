import React, { Fragment } from 'react';
import BaseForm from './BaseForm';
import CloudForm from './CloudForm';

const GlobalTab = () => {
  return (
    <Fragment>
      <BaseForm />
      <CloudForm />
    </Fragment>
  )
}

export default GlobalTab;