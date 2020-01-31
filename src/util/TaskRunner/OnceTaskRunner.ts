const { ipcRenderer } = window.require('electron');

import moment, { Moment } from 'moment';
import schedule, { Job } from 'node-schedule';
import TaskManagerStore from 'src/store/TaskManagerStore';
import { ITaskInfo, RunType } from 'src/store/TaskManagerStore/type';
import { ITaskRunner } from './index';

class OnceTaskRunner implements ITaskRunner {
  public taskInfos: ITaskInfo[];
  public taskPool: Map<string, Job>;

  public constructor() {
    this.taskInfos = TaskManagerStore.getTaskByRunType(RunType.Once);
    this.taskPool = new Map<string, Job>();
  }

  public loadTasks() {
    this.taskInfos.map((t: ITaskInfo) => {
      const taskDate: Moment = t.onceTaskDate!

      // 如果任务的执行时间早于现在 这代表任务已经过期
      if (taskDate.isBefore(moment())) {
        TaskManagerStore.toggleTaskStatus(t.id)
        return
      }
      this.taskPoolPut(t)
    })
  }

  public addTask(id: string) {
    const t = TaskManagerStore.getTaskById(id)
    this.taskPoolPut(t)
  }

  public stopTask(id: string) {
    if (this.taskPool.has(id)) {
      const t: Job = this.taskPool.get(id)!
      t.cancel()
      this.taskPool.delete(id)
    }
  }

  /**
   * 生成计划任务 加入任务池
   * @param t 任务对象
   */
  private taskPoolPut(t: ITaskInfo) {

    // 如果为弹幕任务 需提前五秒钟提前量
    const taskRunDate =
      t.barrage
        ? t.onceTaskDate!.subtract(5, 'seconds')
        : t.onceTaskDate!

    this.taskPool.set(
      t.id,
      schedule.scheduleJob(
        taskRunDate.toDate(),
        this.jobMaker(t)
      )
    )
  }

  private jobMaker(t: ITaskInfo): schedule.JobCallback {
    return () => {
      TaskManagerStore.toggleTaskStatus(t.id)
      if (t.barrage) {
        ipcRenderer.send('barrage-task-run', t.title)
      } else {
        const myNotification = new Notification(t.title, {
          body: t.content
        })
        myNotification.onclick = () => {
          console.log('通知被点击')
        }
      }
    }
  }
}

export default new OnceTaskRunner();