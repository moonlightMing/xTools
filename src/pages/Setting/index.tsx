import { Tabs } from 'antd';
import React from 'react';
import ContentLayout from 'src/layout/ContentLayout';
import AuthTab from './AuthTab';
import CloudDocTab from './CloudDocTab';
import GlobalTab from './GlobalTab';

const { TabPane } = Tabs;

const SettingPage = () => {
  return (
    <ContentLayout className="p-3">
      <Tabs
        defaultActiveKey="1"
        tabPosition="left"
        className="w-100"
        style={{ userSelect: 'none' }}
      >

        <TabPane tab="全局设置" key="global">
          <GlobalTab />
        </TabPane>

        <TabPane tab="密码锁" key="authLock">
          <AuthTab />
        </TabPane>

      </Tabs>
    </ContentLayout>
  )
}

export default SettingPage;