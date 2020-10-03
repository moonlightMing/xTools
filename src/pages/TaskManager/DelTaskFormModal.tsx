import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { TaskManagerStore } from 'src/store/TaskManagerStore';
import { RunType } from 'src/store/TaskManagerStore/type';
import { LoopTaskRunner, OnceTaskRunner } from 'src/util/TaskRunner';

interface IDelTaskFormModalProps extends React.Props<React.FC> {
  TaskManagerStore: TaskManagerStore
}

const DelTaskFormModal: React.FC = (props: IDelTaskFormModalProps) => {

  const onOk = () => {
    const currentDelTaskId = props.TaskManagerStore.CurrentDelTaskId;
    const t = props.TaskManagerStore.getTaskById(currentDelTaskId)

    props.TaskManagerStore.toggleDelTaskModalVisibled()
    // 停止任务执行
    if (t.runType === RunType.Once) {
      OnceTaskRunner.stopTask(currentDelTaskId)
    } else if (t.runType === RunType.Loop) {
      LoopTaskRunner.stopTask(currentDelTaskId)
    }
    // 删除任务存储
    props.TaskManagerStore.DelCurrentTask();
  }

  const onCancel = () => {
    props.TaskManagerStore.toggleDelTaskModalVisibled()
  }

  return (
    <Modal
      title="删除任务计划"
      visible={props.TaskManagerStore.DelTaskModalVisibled}
      onOk={onOk}
      onCancel={onCancel}
    >
      <span>是否删除任务计划</span>
      <span className="font-weight-bold mx-1">{props.TaskManagerStore.CurrentDelTaskTitle}</span>
      <span>?</span>
    </Modal>
  )
}

export default inject('TaskManagerStore')(observer(DelTaskFormModal));