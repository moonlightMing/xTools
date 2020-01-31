import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'mobx-react';
import * as React from 'react';
import stores from 'src/store';
import './App.scss';
import BasicLayout from './layout/BasicLayout';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        {/* mobx-provider */}
        <Provider {...stores}>
          {/* antd-locale-provider */}
          <ConfigProvider locale={zhCN}>
            <BasicLayout />
          </ConfigProvider>
        </Provider>
      </div>
    );
  }
}

export default App;
