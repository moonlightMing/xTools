import { Checkbox, Icon, Popover, Tooltip } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { useDrag } from 'react-dnd'
import { TaskManagerStore } from 'src/store/TaskManagerStore';
import { ITaskInfo, RunType, TaskStatus, TaskType } from 'src/store/TaskManagerStore/type';
import { LoopTaskRunner, OnceTaskRunner } from 'src/util/TaskRunner';

interface ITaskItemProps {
  TaskManagerStore?: TaskManagerStore
  task: ITaskInfo
}

export interface IItem {
  name: string
  type: string
  taskType: TaskType
}

const dataStr = (t: ITaskInfo): string => {
  const chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七"];
  if (t.runType === RunType.Once) {
    // 单次任务直接显示执行日期
    return t.onceTaskDate!.format("YYYY-MM-DD HH:mm:ss")
  } else {
    // 循环任务
    const dayTime = t.loopTaskDate!.time.format("HH:mm:ss");
    switch (t.loopTaskDate!.cycle[0]) {
      case "day":
        return `每天 ${dayTime}`
      case "week":
        return `每周${chnNumChar[t.loopTaskDate!.cycle[1]]} ${dayTime}`
      case "month":
        return `每月${t.loopTaskDate!.cycle[1]}号 ${dayTime}`
    }
  }
  return ''
}

const TaskItem = (props: ITaskItemProps) => {
  const { task } = props;
  const [{ opacity }, dragRef] = useDrag({
    item: { name: task.id, type: 'task', taskType: task.taskType } as IItem,
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0 : 1,
    }),
  })
  const onItemRightClick = (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    props.TaskManagerStore!.setDelCurrentTask(task.id);
    props.TaskManagerStore!.toggleDelTaskModalVisibled();
  }
  const onChcekboxChange = (e: CheckboxChangeEvent) => {
    // 只执行一次的任务不允许主动切换任务状态
    if (task.runType === RunType.Once) {
      return
    }
    props.TaskManagerStore!.toggleTaskStatus(task.id)
    if (task.runType === RunType.Loop) {
      if (e.target.checked) {
        LoopTaskRunner.stopTask(task.id)
      } else {
        LoopTaskRunner.addTask(task.id)
      }
    }
  }

  // 每个item的展示内容
  const title = (
    // 已完成的任务需要添加中横线作为废弃标识
    <span
      style={
        task.taskStatus === TaskStatus.Finished
          ?
          { textDecoration: 'line-through' }
          :
          {}
      }
    >
      {task.title}
    </span>
  )

  const checkBox = (
    <Checkbox
      className="rounded bg-white border w-100 h-100 px-3 py-2"
      style={{ opacity }}
      checked={task.taskStatus === TaskStatus.Finished}
      onChange={onChcekboxChange}
    >
      {
        task.content
          ?
          <Popover title={task.title} content={task.content} placement="rightTop" trigger="hover">
            {title}
          </Popover>
          :
          title
      }
      {
        task.runType === RunType.Once
          ?
          <Tooltip title={dataStr(task)} placement="leftTop" trigger="hover">
            <Icon className="float-right" style={{ fontSize: '20px' }} type="clock-circle" />
          </Tooltip>
          :
          null
      }
      {
        task.runType === RunType.Loop
          ?
          <Tooltip title={dataStr(task)} placement="leftTop" trigger="hover">
            <Icon className="float-right" style={{ fontSize: '20px' }} type="redo" />
          </Tooltip>
          :
          null
      }
    </Checkbox>
  )

  return (
    <div
      className="w-100"
      ref={dragRef}
      onContextMenu={onItemRightClick}
    >
      {checkBox}
    </div >
  )
}

export default inject('TaskManagerStore')(observer(TaskItem));