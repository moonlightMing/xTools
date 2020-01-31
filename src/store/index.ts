import CloudDocStore from './CloudDocStore';
import PassbookStore from './PassbookStore';
import SettingStore from './SettingStore';
import TaskManagerStore from './TaskManagerStore';

import './ipcEvent';

const stores = {
  CloudDocStore,
  PassbookStore,
  TaskManagerStore,
  SettingStore,
}

export default stores;