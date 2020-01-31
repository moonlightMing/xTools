import { List } from 'antd';
import React from 'react';
import { ITaskInfo, TaskStatus } from 'src/store/TaskManagerStore/type';
import TaskItem from '../TaskItem';
import './index.scss';

interface ITaskListProps {
  dataSource: ITaskInfo[]
}

const renderItem = (item: ITaskInfo, index: number) => (
  <List.Item>
    <TaskItem
      task={item}
    />
  </List.Item>
)


const TaskList = (props: ITaskListProps) => {
  return (
    <div className="mh-100 overflow-auto px-1">
      <List
        dataSource={props.dataSource}
        bordered={false}
        split={false}
        size="small"
        renderItem={renderItem}
      />
    </div>
  )
}

export default TaskList;