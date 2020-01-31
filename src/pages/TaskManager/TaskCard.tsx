import { Button, Divider } from 'antd';
import React from 'react';
import { useDrop } from 'react-dnd';
import { ITaskInfo, TaskType } from 'src/store/TaskManagerStore/type';
import TaskList from './TaskList';

import { IItem } from './TaskItem';

interface ITaskCardProps {
  taskType: TaskType
  title: string
  titleColor: string
  taskList: ITaskInfo[]
  onAddBtnClock: (taskType: TaskType) => void
  onCardDrop: (taskId: string, taskType: TaskType) => void
}

const TaskCard = (props: ITaskCardProps) => {

  const [{ }, dropRef] = useDrop({
    accept: ['task'],
    drop: (item: IItem) => {
      if (item.taskType === props.taskType) {
        return
      }
      props.onCardDrop(item.name, props.taskType)
    }
  })

  const onClick = () => {
    props.onAddBtnClock(props.taskType)
  }

  return (
    <div
      className="container-fluid h-100 d-flex flex-column border border-primary rounded px-3 py-3"
      style={{ userSelect: 'none' }}
      ref={dropRef}
    >
      <div>
        <span style={{ color: props.titleColor, fontSize: '16px' }}>
          {props.title}
        </span>
        <Button
          icon="plus"
          className="float-right"
          onClick={onClick}
        />
      </div>
      <Divider className="my-2" />
      <TaskList
        dataSource={props.taskList}
      />
    </div>
  )
}

export default TaskCard;