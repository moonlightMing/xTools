import { Job } from 'node-schedule';
import { ITaskInfo } from 'src/store/TaskManagerStore/type';
import LoopTaskRunner from './LoopTaskRunner';
import OnceTaskRunner from './OnceTaskRunner';

export interface ITaskRunner {
  taskInfos: ITaskInfo[]
  taskPool: Map<string, Job>
  addTask: (id: string) => void
  stopTask: (id: string) => void
}

export {
  OnceTaskRunner,
  LoopTaskRunner
}
