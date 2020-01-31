import CloudDoc from 'src/pages/CloudDoc';
import Passbook from 'src/pages/Passbook';
import Setting from 'src/pages/Setting';
import TaskManager from 'src/pages/TaskManager';

interface IRoute {
  name: string
  title: string
  icon: string
  path: string
  component: React.ComponentClass<any, any> | React.FunctionComponent<any> | undefined
}

const Routes: IRoute[] = [
  {
    name: "taskmanager",
    title: "任务单",
    icon: "unordered-list",
    path: "/taskmanager",
    component: TaskManager
  },
  {
    name: "passbook",
    title: "密码本",
    icon: "lock",
    path: "/passbook",
    component: Passbook
  },
  {
    name: "yundoc",
    title: "云文档",
    icon: "book",
    path: "/yundoc",
    component: CloudDoc
  },
  {
    name: "setting",
    title: "设置",
    icon: "setting",
    path: "/setting",
    component: Setting
  }
];

export default Routes;
