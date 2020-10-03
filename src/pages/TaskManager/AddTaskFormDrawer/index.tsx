import { Button, Checkbox, DatePicker, Drawer, Form, Input, Radio } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React from 'react';
import { SettingStore } from 'src/store/SettingStore';
import { TaskManagerStore } from 'src/store/TaskManagerStore';
import { IFormValue, RunType, TaskTitle } from 'src/store/TaskManagerStore/type';
import { LoopTaskRunner, OnceTaskRunner } from 'src/util/TaskRunner';
import LoopInput from './LoopInput';

const { ipcRenderer } = window.require('electron');

const { TextArea } = Input;

interface IAddTaskFormProps extends FormComponentProps {
  createTask: (value: IFormValue) => void
}

const AddTaskForm = Form.create<IAddTaskFormProps>({ name: 'AddTaskForm' })(
  class extends React.Component<IAddTaskFormProps, any> {
    public render() {

      const { getFieldDecorator, getFieldValue } = this.props.form;

      return (
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ message: '必须填写任务标题!', required: true }],
            })(
              <Input placeholder="Title" />,
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator('content', {
              rules: [{ message: 'Input task content!', required: false }],
            })(
              <TextArea placeholder="Content" autoSize={{ minRows: 4 }} />,
            )}
          </Form.Item>

          <Form.Item key="runType">
            {getFieldDecorator('runType', {
              initialValue: 0,
            })(
              <Radio.Group>
                <Radio.Button value={RunType.Normal}>不提醒</Radio.Button>
                <Radio.Button value={RunType.Once}>提醒一次</Radio.Button>
                <Radio.Button value={RunType.Loop}>循环提醒</Radio.Button>
              </Radio.Group>
            )}
          </Form.Item>

          <Form.Item>
            {getFieldValue('runType') === RunType.Once || getFieldValue('runType') === RunType.Loop
              ?
              getFieldDecorator('barrage', {
                initialValue: false,
                valuePropName: 'checked',
              })(
                <Checkbox>
                  弹幕提醒
                </Checkbox>
              ) : null
            }
          </Form.Item>

          <Form.Item>
            {getFieldValue('runType') === RunType.Once
              ? getFieldDecorator('onceTaskDate', {
                rules: [{ required: true }]
              })(
                <DatePicker
                  autoFocus={true}
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledDate}
                  disabledTime={this.disabledDateTime}
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  showToday={false}
                />
              )
              : null
            }
            {getFieldValue('runType') === RunType.Loop
              ? getFieldDecorator('loopTaskDate', {
                rules: [{ required: true }]
              })(
                <LoopInput />
              )
              : null
            }
          </Form.Item>

          <Button type="primary" htmlType="submit" block={true}>
            确定
          </Button>
        </Form >
      )
    }

    private handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      this.props.form.validateFields((err: Error, values: IFormValue) => {
        if (!err) {
          this.props.createTask(values);
        }
      });
    };

    private disabledDate(current: moment.Moment) {
      return current && current < moment().endOf('day').subtract(1, 'days');
    }

    private disabledDateTime(current: moment.Moment): {
      disabledHours?: (() => number[]) | undefined;
      disabledMinutes?: (() => number[]) | undefined;
      disabledSeconds?: (() => number[]) | undefined;
    } {
      const range = (start: number, end: number) => {
        const result = [];
        for (let i = start; i < end; i++) {
          result.push(i);
        }
        return result;
      }
      const isToday = (): boolean => {
        return current && current.day() === moment().day()
      }
      return {
        disabledHours: () => {
          if (!isToday()) {
            return [];
          }
          return range(0, moment().hour())
        },
        disabledMinutes: () => {
          if (!isToday()) {
            return [];
          }
          return current && current.hour() === moment().hour()
            ? range(0, moment().add(10, 'minutes').minute())
            : [];
        },
        disabledSeconds: () => {
          if (!isToday()) {
            return [];
          }
          return current && current.minute() === moment().minute()
            ? range(0, moment().second())
            : [];
        }
      }
    }
  }
)

interface IAddTaskFormDrawerProps extends React.Props<React.FC> {
  TaskManagerStore: TaskManagerStore
  SettingStore: SettingStore
}

const AddTaskFormDrawer: React.FC = (props: IAddTaskFormDrawerProps) => {
  const onDrawerClose = () => {
    props.TaskManagerStore.toggleAddTaskFormModalVisibled();
  }
  const createTask = (value: IFormValue) => {
    props.TaskManagerStore.toggleAddTaskFormModalVisibled();
    value.taskType = props.TaskManagerStore.CurrentFormTaskType;
    const taskId = props.TaskManagerStore.addTask(value);
    if (value.runType === RunType.Once) {
      OnceTaskRunner.addTask(taskId)
    } else if (value.runType === RunType.Loop) {
      LoopTaskRunner.addTask(taskId)
    }

    // 云同步
    if (props.SettingStore.AutoAsync) {
      ipcRenderer.send('request-upload-store', 'taskmanager')
    }
  }
  return (
    <Drawer
      visible={props.TaskManagerStore.AddTaskFormModalVisibled}
      title={TaskTitle[props.TaskManagerStore.CurrentFormTaskType]}
      placement="right"
      closable={true}
      onClose={onDrawerClose}
      destroyOnClose={true}
      width={512}
    >
      <AddTaskForm createTask={createTask} />
    </Drawer>
  )
}

export default inject('TaskManagerStore', 'SettingStore')(observer(AddTaskFormDrawer));
