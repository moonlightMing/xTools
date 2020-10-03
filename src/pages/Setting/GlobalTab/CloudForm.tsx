const { ipcRenderer } = window.require('electron');

import { Button, Checkbox, Form, Input, message, Select } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import useIpcRenderer from 'src/hook/useIpcRenderer';
import { SettingStore } from 'src/store/SettingStore';
import { ObjectStoreType } from 'src/store/SettingStore/type';
import FormWrapper from '../FormWrapper';

interface ICloudFormProps extends React.Props<React.FC> {
  SettingStore: SettingStore
}

const CloudForm: React.FC = (props: ICloudFormProps) => {

  const [checking, setChecking] = useState(false)

  useIpcRenderer({
    'cloudstore-auth-check-reply': (_: any, reply: any) => {
      // 校验通过
      if (reply === 'ok') {
        message.success('校验通过!')
        props.SettingStore.setCloudAuthChecked(true)
      } else if (reply.error) {
        // 校验失败
        if (reply.error.Code) {
          message.error(reply.error.Code)
        } else if (reply.error.code) {
          message.error(reply.error.code)
        } else {
          message.error(reply.error)
        }
      }
      setChecking(false)
    }
  })

  const onAutoSyncCheckboxChange = (e: CheckboxChangeEvent) => {
    const { checked } = e.target;
    props.SettingStore.setAutoAsync(checked);
  }

  const onObjectStoreTypeSelectChange = (value: ObjectStoreType) => {
    if (value === props.SettingStore.curObjectStoreType) {
      return
    }
    props.SettingStore.setObjectStoreType(value)
    if (props.SettingStore.CloudAuthChecked) {
      props.SettingStore.setCloudAuthChecked(false);
    }
    if (props.SettingStore.AutoAsync) {
      props.SettingStore.setAutoAsync(false);
    }
  }

  const onCheckBtnClock = () => {
    setChecking(true)
    ipcRenderer.send('cloudstore-auth-check', {
      Bucket: props.SettingStore.Bucket,
      Region: props.SettingStore.Region,
      SecretId: props.SettingStore.SecretId,
      SecretKey: props.SettingStore.SecretKey
    })
  }

  // 表单中修改了任意一项 都需要重新验证可用性
  const onInputBlur = (type: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      e.persist()

      const inputValue = e.currentTarget.value;
      switch (type) {
        case 'Bucket':
          props.SettingStore.setBucket(inputValue)
          break
        case 'Region':
          props.SettingStore.setRegion(inputValue)
          break
        case 'SecretId':
          props.SettingStore.setSecretId(inputValue)
          break
        case 'SecretKey':
          props.SettingStore.setSecretKey(inputValue)
      }

      if (props.SettingStore.CloudAuthChecked) {
        props.SettingStore.setCloudAuthChecked(false);
      }
      if (props.SettingStore.AutoAsync) {
        props.SettingStore.setAutoAsync(false);
      }

      ipcRenderer.send('set-tray-cloudsync-disable')
    }
  }

  return (
    <FormWrapper title="云同步">
      <Form.Item className="row">
        <Checkbox
          className="col-3"
          onChange={onAutoSyncCheckboxChange}
          checked={props.SettingStore.AutoAsync}
          disabled={!props.SettingStore.CloudAuthChecked}
        >
          自动同步
        </Checkbox>
        <Select
          defaultValue={props.SettingStore.curObjectStoreType}
          onSelect={onObjectStoreTypeSelectChange}
          className="pr-3 col-5"
        >
          {
            Object.values(ObjectStoreType).map((v: string, i: number) => (
              <Select.Option key={i} value={v}>
                {v}
              </Select.Option>
            ))
          }
        </Select>
        <Button
          type="primary"
          className="col-2"
          onClick={onCheckBtnClock}
          disabled={props.SettingStore.CloudAuthChecked || checking}
          loading={checking}
        >
          {
            props.SettingStore.CloudAuthChecked
              ? "已验证"
              : "验证"
          }
        </Button>
      </Form.Item>

      <Form.Item label="Bucket">
        <Input
          onChange={onInputBlur("Bucket")}
          defaultValue={props.SettingStore.Bucket}
        />
      </Form.Item>

      <Form.Item label="Region">
        <Input
          onChange={onInputBlur("Region")}
          defaultValue={props.SettingStore.Region}
        />
      </Form.Item>

      <Form.Item label="SecretId">
        <Input
          onChange={onInputBlur("SecretId")}
          defaultValue={props.SettingStore.SecretId}
        />
      </Form.Item>

      <Form.Item label="SecretKey">
        <Input.Password
          onChange={onInputBlur("SecretKey")}
          defaultValue={props.SettingStore.SecretKey}
        />
      </Form.Item>

    </FormWrapper >
  )
}

export default inject('SettingStore')(observer(CloudForm));