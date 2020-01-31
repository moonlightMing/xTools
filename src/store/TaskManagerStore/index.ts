import { action, computed, observable, toJS } from 'mobx';
import moment from 'moment';
import shortid from 'shortid';
import NewDB from 'src/util/DataDB';
import { IFormValue, ITaskInfo, RunType, TaskStatus, TaskType } from './type';

const dbParams = {
  dbName: 'taskmanager',
  encryption: true,
  defaultValue: {
    tasks: [] as ITaskInfo[],
  }
}

export class TaskManagerStore {

  private TaskManagerDB: any
  @observable private taskList: ITaskInfo[];
  @observable private addTaskFormModalVisibled: boolean;
  @observable private currentFormTaskType: TaskType;
  @observable private delTaskModalVisibled: boolean;
  @observable private currentDelTaskId: string;

  constructor() {
    this.reloadStore()
  }

  @action
  public reloadStore() {
    this.TaskManagerDB = NewDB(dbParams)
    this.flushTaskList()
    this.addTaskFormModalVisibled = false;
    this.delTaskModalVisibled = false;
  }

  @action
  public updateTaskType(id: string, taskType: TaskType) {
    this.TaskManagerDB
      .get('tasks')
      .find({ id })
      .assign({ taskType, updateTime: new Date().getTime() })
      .write()
    this.flushTaskList()
  }

  @computed
  public get TaskList(): ITaskInfo[] {
    return toJS(this.taskList);
  }

  @computed
  public get AddTaskFormModalVisibled(): boolean {
    return this.addTaskFormModalVisibled;
  }

  @action
  public setCurrentFormTaskType(currentFormTaskType: TaskType) {
    this.currentFormTaskType = currentFormTaskType;
  }


  @computed
  public get DelTaskModalVisibled(): boolean {
    return this.delTaskModalVisibled;
  }

  @action
  public toggleDelTaskModalVisibled() {
    this.delTaskModalVisibled = !this.delTaskModalVisibled;
  }

  @computed
  public get CurrentDelTaskId(): string {
    return this.currentDelTaskId;
  }

  @action
  public DelCurrentTask() {
    this.TaskManagerDB
      .get('tasks')
      .remove({ id: this.currentDelTaskId })
      .write();
    this.flushTaskList()
  }

  @action
  public setDelCurrentTask(delId: string) {
    this.currentDelTaskId = delId;
  }

  @computed
  public get CurrentFormTaskType(): TaskType {
    return this.currentFormTaskType;
  }

  @computed
  public get CurrentDelTaskTitle(): string {
    if (!this.currentDelTaskId) {
      return ''
    }
    const task: ITaskInfo = toJS(this.TaskManagerDB
      .get('tasks')
      .find({ id: this.currentDelTaskId })
      .value());
    return task.title;
  }

  @action
  public toggleAddTaskFormModalVisibled() {
    this.addTaskFormModalVisibled = !this.addTaskFormModalVisibled;
  }

  @action
  public addTask(value: IFormValue): string {
    const id = shortid.generate();
    const task: ITaskInfo = {
      id,
      title: value.title,
      content: value.content,
      createTime: new Date().getTime(),
      updateTime: 0,
      taskType: value.taskType,
      taskStatus: TaskStatus.Running,
      runType: value.runType,
      barrage: value.barrage,
      onceTaskDate: value.onceTaskDate,
      loopTaskDate: value.loopTaskDate
    }
    this.TaskManagerDB
      .get('tasks')
      .push(task)
      .write();
    this.flushTaskList();
    return id;
  }

  @action
  public toggleTaskStatus(id: string) {
    const task: ITaskInfo = this.TaskManagerDB
      .get('tasks')
      .find({ id })
      .value()

    const toggleStatus =
      task.taskStatus === TaskStatus.Running
        ? TaskStatus.Finished
        : TaskStatus.Running

    this.TaskManagerDB
      .get('tasks')
      .find({ id })
      .assign({ taskStatus: toggleStatus })
      .write()

    this.flushTaskList()
  }

  public getTaskByRunType(type: RunType): ITaskInfo[] {
    return this.taskList.filter(
      t =>
        t.runType === type
        &&
        t.taskStatus === TaskStatus.Running
    )
  }

  public getTaskByTaskType(taskType: TaskType): ITaskInfo[] {
    const allArr = toJS(this.taskList.filter(t => t.taskType === taskType))
    // 创建时间近的排在前面
    const runningTasks = allArr
      .filter(t => t.taskStatus === TaskStatus.Running)
      .sort((a, b) => b.createTime - a.createTime)
    const finishedTasks = allArr
      .filter(t => t.taskStatus === TaskStatus.Finished)
      .sort((a, b) => b.createTime - a.createTime)

    // 已完成的任务排在进行中任务后面
    return runningTasks.concat(...finishedTasks)
  }

  public getTaskById(id: string): ITaskInfo {
    const task: ITaskInfo = toJS(this.TaskManagerDB.get('tasks').find({ id }).value())
    if (task.runType === RunType.Once) {
      task.onceTaskDate = moment(task.onceTaskDate)
    } else if (task.runType === RunType.Loop) {
      task.loopTaskDate!.time = moment(task.loopTaskDate!.time)
    }
    return task
  }

  private flushTaskList() {
    const list: ITaskInfo[] = toJS(this.TaskManagerDB.get('tasks').value());
    this.taskList = list.map(t => {
      if (t.onceTaskDate) {
        t.onceTaskDate = moment(t.onceTaskDate)
      }
      if (t.loopTaskDate) {
        t.loopTaskDate.time = moment(t.loopTaskDate.time)
      }
      return t
    })
  }
}

export default new TaskManagerStore();