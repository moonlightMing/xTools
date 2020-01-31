import { Checkbox, Form } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { SettingStore } from 'src/store/SettingStore';
import FormWrapper from '../FormWrapper';

const { ipcRenderer } = window.require('electron');

interface IBaseFormProps extends React.Props<React.SFC> {
  SettingStore: SettingStore
}

const BaseForm: React.SFC = (props: IBaseFormProps) => {

  const onEnableAuthCheckboxChange = (e: CheckboxChangeEvent) => {
    props.SettingStore.setEnableAuthCheck(e.target.checked)

    if (e.target.checked && props.SettingStore.AfkLockEnable) {
      ipcRenderer.send(
        'start-afk-time',
        props.SettingStore.AfkTime
      )
    } else {
      ipcRenderer.send('stop-afk-time')
    }
  }

  return (
    <FormWrapper title="密码锁设置">
      <Form.Item>
        <Checkbox
          onChange={onEnableAuthCheckboxChange}
          checked={props.SettingStore.EnableAuthCheck}
        >
          开启密码验证
        </Checkbox>
      </Form.Item>
    </FormWrapper>
  )
}

export default inject('SettingStore')(observer(BaseForm));