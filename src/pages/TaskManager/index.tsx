import { inject, observer } from 'mobx-react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ContentLayout from 'src/layout/ContentLayout';
import { TaskManagerStore } from 'src/store/TaskManagerStore';
import { TaskColor, TaskTitle, TaskType } from 'src/store/TaskManagerStore/type';

import AddTaskFormDrawer from './AddTaskFormDrawer';
import DelTaskFormModal from './DelTaskFormModal';
import TaskCard from './TaskCard';

import { LoopTaskRunner, OnceTaskRunner } from 'src/util/TaskRunner';

OnceTaskRunner.loadTasks()
LoopTaskRunner.loadTasks()

interface ITaskManagerPageProps {
  TaskManagerStore: TaskManagerStore
}

const TaskManagerPage = (props: ITaskManagerPageProps) => {

  const onCardDrop = (id: string, taskType: TaskType) => {
    props.TaskManagerStore.updateTaskType(id, taskType);
  }

  const onAddBtnClock = (taskType: TaskType) => {
    props.TaskManagerStore.toggleAddTaskFormModalVisibled();
    props.TaskManagerStore.setCurrentFormTaskType(taskType);
  }

  return (
    <ContentLayout>
      <AddTaskFormDrawer />
      <DelTaskFormModal />
      <DndProvider backend={HTML5Backend}>
        <div className="d-flex flex-column w-100 px-3 py-3">
          <div className="d-flex flex-row h-50">
            <div className="w-50 h-100 px-2 py-2">
              <TaskCard
                taskType={TaskType.UrgentAndImportant}
                title={TaskTitle.UrgentAndImportant}
                titleColor={TaskColor.UrgentAndImportant}
                onAddBtnClock={onAddBtnClock}
                taskList={props.TaskManagerStore.getTaskByTaskType(TaskType.UrgentAndImportant)}
                onCardDrop={onCardDrop}
              />
            </div>
            <div className="w-50 h-100 px-2 py-2">
              <TaskCard
                taskType={TaskType.NotUrgentAndImportant}
                title={TaskTitle.NotUrgentAndImportant}
                titleColor={TaskColor.NotUrgentAndImportant}
                onAddBtnClock={onAddBtnClock}
                taskList={props.TaskManagerStore.getTaskByTaskType(TaskType.NotUrgentAndImportant)}
                onCardDrop={onCardDrop}
              />
            </div>
          </div>
          <div className="d-flex flex-row h-50">
            <div className="w-50 h-100 px-2 py-2">
              <TaskCard
                taskType={TaskType.UrgentAndNotImportant}
                title={TaskTitle.UrgentAndNotImportant}
                titleColor={TaskColor.UrgentAndNotImportant}
                onAddBtnClock={onAddBtnClock}
                taskList={props.TaskManagerStore.getTaskByTaskType(TaskType.UrgentAndNotImportant)}
                onCardDrop={onCardDrop}
              />
            </div>
            <div className="w-50 h-100 px-2 py-2">
              <TaskCard
                taskType={TaskType.NotUrgentAndNotImportant}
                title={TaskTitle.NotUrgentAndNotImportant}
                titleColor={TaskColor.NotUrgentAndNotImportant}
                onAddBtnClock={onAddBtnClock}
                taskList={props.TaskManagerStore.getTaskByTaskType(TaskType.NotUrgentAndNotImportant)}
                onCardDrop={onCardDrop}
              />
            </div>
          </div>
        </div>
      </DndProvider>
    </ContentLayout>
  )
}

export default inject('TaskManagerStore')(observer(TaskManagerPage));