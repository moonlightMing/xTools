import { Moment } from 'moment';
/**
 * 任务类型 根据四象限法则划分
 */
export enum TaskType {
  // 紧急且重要
  UrgentAndImportant = 'UrgentAndImportant',
  // 重要不紧急
  NotUrgentAndImportant = 'NotUrgentAndImportant',
  // 紧急但不重要
  UrgentAndNotImportant = 'UrgentAndNotImportant',
  // 不紧急不重要
  NotUrgentAndNotImportant = 'NotUrgentAndNotImportant'
}

/**
 * 任务状态 
 */
export enum TaskStatus {
  // 进行中
  Running,
  // 已完成
  Finished
}

/**
 * 任务的执行类型
 */
export enum RunType {
  // 不做提醒
  Normal,
  // 只提醒一次
  Once,
  // 循环提醒
  Loop,
}

/**
 * 任务对应标识颜色
 */
export enum TaskColor {
  // 紧急且重要
  UrgentAndImportant = '#EE1111',
  // 重要不紧急
  NotUrgentAndImportant = '#FFAD33',
  // 紧急但不重要
  UrgentAndNotImportant = '#50B2F3',
  // 不紧急不重要
  NotUrgentAndNotImportant = '#A2E939'
}

/**
 * 任务对应标题
 */
export enum TaskTitle {
  // 紧急且重要
  UrgentAndImportant = '工作任务，优先完成',
  // 重要不紧急
  NotUrgentAndImportant = '时间规划',
  // 紧急但不重要
  UrgentAndNotImportant = '杂事+临时插入事情+跟进事情',
  // 不紧急不重要
  NotUrgentAndNotImportant = '好习惯，好人生！每日计划'
}

export interface ITaskInfo {
  id: string
  title: string
  content?: string
  createTime: number
  updateTime: number
  taskType: TaskType
  taskStatus: TaskStatus
  runType: RunType
  barrage?: boolean
  onceTaskDate?: Moment
  loopTaskDate?: { cycle: string[], time: Moment }
}

/**
 * 添加或修改任务时传递的数据
 */
export interface IFormValue {
  id?: string
  title: string
  content?: string
  taskType: TaskType
  runType: RunType
  barrage?: boolean
  onceTaskDate?: Moment
  loopTaskDate?: { cycle: string[], time: Moment }
}