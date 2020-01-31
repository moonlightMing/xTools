import { Button, Divider, Form, Icon, Input, message, Modal } from 'antd';
import React, { useState } from 'react';
import { IFormPair } from 'src/store/PassbookStore/type';
import './index.scss';

interface IAddFolderFormModalProps {
  visibled: boolean
  title: string
  okText: string
  cancelText: string
  onOk: (title: string, formValue: IFormPair[]) => void
  onCancal: () => void
  defaultTitle?: string
  defaultData?: IFormPair[]
}

const AddNodeFormModal = (props: IAddFolderFormModalProps) => {
  const [title, setTitle] = useState(props.defaultTitle ? props.defaultTitle : '')
  const [formValue, setFormValue] = useState(props.defaultData ? props.defaultData : [{ key: '', value: '' }])

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const onOk = () => {
    props.onOk(title, formValue)
    setFormValue([{ key: '', value: '' }])
    setTitle('')
  }

  const onCancal = () => {
    props.onCancal()
    setFormValue([{ key: '', value: '' }])
    setTitle('')
  }

  const addValues = () => {
    const cloneArr = formValue.slice()
    cloneArr.push({ key: '', value: '' })
    setFormValue(cloneArr)
  }

  const removeValues = (index: number) => {
    const cloneArr = formValue.slice()
    cloneArr.splice(index, 1)
    setFormValue(cloneArr)
  }

  const CloseBtn = (index: number) => {
    const onClick = () => {
      removeValues(index)
    }
    return (
      <Icon
        type="minus-circle-o"
        onClick={onClick}
        className="dynamic-delete-button col-1"
      />
    )
  }

  return (
    <Modal
      visible={props.visibled}
      title={props.title}
      okText={props.okText}
      cancelText={props.cancelText}
      onCancel={onCancal}
      onOk={onOk}
    >
      <Form layout="vertical">
        <Input placeholder="Title" value={title} onChange={onTitleChange} />
        <Divider className="mt-2 mb-2" />
        {
          formValue.map((v, i) => {
            const onInputKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const cloneArr = formValue.slice()
              cloneArr[i].key = e.target.value
              setFormValue(cloneArr)
            }
            const onInputvalueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const cloneArr = formValue.slice()
              cloneArr[i].value = e.target.value
              setFormValue(cloneArr)
            }
            return (
              <div className="container-fluid row mx-0 px-0 mb-2" key={i}>
                <Input className="col-3" key={`${i}-key`} value={v.key} size="small" onChange={onInputKeyChange} />
                <span className="col-1">:</span>
                <Input className="container-fluid col" key={`${i}-value`} value={v.value} size="small" onChange={onInputvalueChange} />
                {formValue.length >= 2 ? CloseBtn(i) : null}
              </div>
            )
          })
        }
        <Button type="dashed" onClick={addValues} block={true}>
          <Icon type="plus" /> Add value
        </Button>
      </Form>
    </Modal>
  )
}

export default AddNodeFormModal;