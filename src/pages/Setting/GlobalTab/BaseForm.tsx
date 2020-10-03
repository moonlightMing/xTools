import { Checkbox, Form, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { IpcRendererEvent } from 'electron';
import { inject, observer } from 'mobx-react';
import React from 'react';
import useIpcRenderer from 'src/hook/useIpcRenderer';
import { SettingStore } from 'src/store/SettingStore';
import FormWrapper from '../FormWrapper';

const { ipcRenderer } = window.require('electron');

interface IBaseFormProps extends React.Props<React.FC> {
  SettingStore: SettingStore
}

const BaseForm: React.FC = (props: IBaseFormProps) => {

  useIpcRenderer({
    'resp-auto-start': (_: IpcRendererEvent, isSuc: boolean, msg: string) => {
      if (isSuc) {
        message.success(msg)
      } else {
        message.error(msg)
      }
    }
  })

  const onAutoStartChkBoxChange = (e: CheckboxChangeEvent) => {
    props.SettingStore.setAutoStart(e.target.checked)
    ipcRenderer.send('request-auto-start', e.target.checked)
  }

  return (
    <FormWrapper title="基本设置">

      <Form.Item>
        <Checkbox
          onChange={onAutoStartChkBoxChange}
          checked={props.SettingStore.AutoStart}
        >
          Windows开机自启
      </Checkbox>
      </Form.Item>

    </FormWrapper>
  )
}

export default inject('SettingStore')(observer(BaseForm));