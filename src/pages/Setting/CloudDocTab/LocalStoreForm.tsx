import { Button, Form, Input } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { SettingStore } from 'src/store/SettingStore';
import FormWrapper from '../FormWrapper';

const { ipcRenderer } = window.require('electron');

interface ILocalStoreFormProps extends React.Props<React.FC> {
  SettingStore: SettingStore
}

const LocalStoreForm: React.FC = (props: ILocalStoreFormProps) => {

  const onSecretIdInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.persist()
    props.SettingStore.setSecretId(event.currentTarget.value)
  }

  const onClick = () => {
    ipcRenderer.send('barrage-task-run', `记得更新啊${Math.random()}`)
  }

  return (
    <FormWrapper title="本地文件">

      <Form.Item label="SecretId">
        <Input
          onBlur={onSecretIdInputBlur}
          defaultValue={props.SettingStore.SecretId}
          className="mr-2"
          style={{ width: '80%' }}
        />
        <Button
          icon="dash"
        />
      </Form.Item>

      <Form.Item>
        <Button onClick={onClick}>
          dianwo
          </Button>
      </Form.Item>

    </FormWrapper>
  )
}

export default inject('SettingStore')(observer(LocalStoreForm));