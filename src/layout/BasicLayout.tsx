import { Icon, Layout, Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import { HashRouter as Router, Link, Route, Switch } from 'react-router-dom';
import { SettingStore } from 'src/store/SettingStore';
import HeadBtn from './HeadBtn';
import Routes from './Routes';

import './BasicLayout.scss';

const { remote } = window.require('electron');

const { Content, Sider } = Layout;

interface IBasicLayoutProps extends React.PropsWithChildren<React.SFC> {
  SettingStore: SettingStore,
}

const disableMouseDrag = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  e.preventDefault()
}

const BasicLayout: React.SFC = (props: IBasicLayoutProps) => {

  const firstRoute = Routes[0];
  const mainWindow = remote.getCurrentWindow()
  const [winMax, setWinMax] = useState(false)

  mainWindow.on('maximize', () => setWinMax(true))

  mainWindow.on('unmaximize', () => setWinMax(false))

  const onCollapse = (): void => {
    props.SettingStore.toggleSiderMenuCollapse()
  }

  const onMinimizeBtnClick = () => {
    remote.getCurrentWindow().minimize()
  }

  const onMaxmizeBtnClick = () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }

  const onCloseBtnClick = () => {
    mainWindow.minimize()
    mainWindow.setSkipTaskbar(true)
  }

  return (
    <Router>
      <Layout className="vh-100 border-right">
        <Sider
          collapsible={true}
          collapsed={props.SettingStore.SiderMenuCollapse}
          onCollapse={onCollapse}
          width={120}
          theme="dark"
          style={{ background: '#5576bd' }}
        >
          <div
            className="d-flex justify-content-center head-title"
          >
            <span className="text-light font-weight-bold align-self-center">
              xTools
            </span>
          </div>
          <Menu
            theme="dark"
            style={{ background: '#5576bd', userSelect: 'none' }}
            defaultSelectedKeys={[firstRoute.name]}
            mode="inline"
            className="nodrag"
          >
            {Routes.map((route, _) => (
              <Menu.Item key={route.name} title={route.title} className="text-left">
                <Link to={route.path} onMouseDown={disableMouseDrag} onMouseDownCapture={disableMouseDrag}>
                  <Icon type={route.icon} />
                  <span style={{ textAlign: 'justify', textAlignLast: 'justify', width: '50px', display: 'inline-block' }}>{route.title}</span>
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout className="border-top">
          <div className="header">
            <div className="h-100">
              <HeadBtn
                btnType={"close"}
                hoverColor={"#F45454"}
                onClick={onCloseBtnClick}
              />
              <HeadBtn
                btnType={winMax ? "block" : "border"}
                hoverColor={"#E3E3E3"}
                onClick={onMaxmizeBtnClick}
              />
              <HeadBtn
                btnType={"minus"}
                hoverColor={"#E3E3E3"}
                onClick={onMinimizeBtnClick}
              />
            </div>
          </div>
          <Content className="vh-100 border-bottom">
            <Switch>
              {/* 去除第一个路由 作默认路由 */}
              {Routes.slice(1).map((route, _) => (
                <Route
                  key={route.name}
                  extra={true}
                  path={route.path}
                  component={route.component}
                />
              ))}
              <Route path="/" component={firstRoute.component} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </Router >
  )
}

export default inject('SettingStore')(observer(BasicLayout));