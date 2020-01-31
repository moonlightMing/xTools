const { ipcRenderer } = window.require('electron');

import moment from 'moment';
import schedule, { Job } from 'node-schedule';
import TaskManagerStore from 'src/store/TaskManagerStore';
import { ITaskInfo, RunType, } from 'src/store/TaskManagerStore/type';
import { ITaskRunner } from './index';

class LoopTaskRunner implements ITaskRunner {
  public taskInfos: ITaskInfo[];
  public taskPool: Map<string, Job>;

  public constructor() {
    this.taskInfos = TaskManagerStore.getTaskByRunType(RunType.Loop);
    this.taskPool = new Map<string, Job>();
  }

  public loadTasks() {
    this.taskInfos.map((t: ITaskInfo) => {
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

  private cronStr(loopTaskDate: { cycle: string[]; time: moment.Moment; }): string {
    const date = loopTaskDate.time.toDate()
    switch (loopTaskDate.cycle[0]) {
      case "day":
        return `${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} * * *`
      case "week":
        return `${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} * * ${loopTaskDate.cycle[1]}`
      case "month":
        return `${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} ${loopTaskDate.cycle[1]} * *`
      default:
        return ''
    }
  }

  /**
   * 生成计划任务 加入任务池
   * @param t 任务对象
   */
  private taskPoolPut(t: ITaskInfo) {

    // 如果为弹幕任务 需提前五秒钟提前量
    if (t.barrage) {
      t.loopTaskDate!.time = t.loopTaskDate!.time.subtract(5, 'seconds')
    }

    this.taskPool.set(
      t.id,
      schedule.scheduleJob(
        this.cronStr(t.loopTaskDate!),
        this.jobMaker(t)
      )
    )
  }

  private jobMaker(t: ITaskInfo): schedule.JobCallback {
    return () => {
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

export default new LoopTaskRunner();