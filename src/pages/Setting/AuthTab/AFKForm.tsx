import { Checkbox, Form, InputNumber } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { SettingStore } from 'src/store/SettingStore';
import FormWrapper from '../FormWrapper';

const { ipcRenderer } = window.require('electron');

interface IAFKFormProps extends React.Props<React.SFC> {
  SettingStore: SettingStore
}

const AFKForm: React.SFC = (props: IAFKFormProps) => {

  if (!props.SettingStore.EnableAuthCheck) {
    return null
  }

  const onAfkLockEnableCheckedChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      ipcRenderer.send('start-afk-time', props.SettingStore.AfkTime)
    } else {
      ipcRenderer.send('stop-afk-time')
    }
    props.SettingStore.setAfkLockEnable(e.target.checked)
  }

  const changeAfkLockEnable = () => {
    if (!props.SettingStore.AfkLockEnable) {
      ipcRenderer.send('start-afk-time', props.SettingStore.AfkTime)
    } else {
      ipcRenderer.send('stop-afk-time')
    }
    props.SettingStore.setAfkLockEnable(!props.SettingStore.AfkLockEnable)
  }

  const onTimeInputChange = (value: number) => {
    if (!value) {
      return
    }
    props.SettingStore.setAfkTime(value)

    if (props.SettingStore.AfkLockEnable) {
      ipcRenderer.send('change-afk-time', value)
    }
  }

  const afkTimeInput = (
    <InputNumber
      min={1}
      max={180}
      // size="small"
      value={props.SettingStore.AfkTime}
      onChange={onTimeInputChange}
      className="mx-2"
      style={{ width: '80px' }}
    />
  )

  return (
    <FormWrapper title="挂机锁">
      <Form.Item>
        <Checkbox
          className="mr-2"
          checked={props.SettingStore.AfkLockEnable}
          onChange={onAfkLockEnableCheckedChange}
        />
        <span onClick={changeAfkLockEnable} style={{ cursor: 'pointer' }}>
          键鼠无操作
        </span>
        {afkTimeInput}
        <span onClick={changeAfkLockEnable} style={{ cursor: 'pointer' }}>
          分钟后自动锁定
        </span>
      </Form.Item>
    </FormWrapper>
  )
}

export default inject('SettingStore')(observer(AFKForm));