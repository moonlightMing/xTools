import React, { Fragment } from 'react';
import ContentLayout from 'src/layout/ContentLayout';
import SiderLayout from 'src/layout/SiderLayout';
import DelModal from './DelModal';
import DocList from './DocList';
import EditPage from './EditPage';
import ListDisplayModalSwitch from './ListDisplayModalSwitch';
import RollbackBtn from './RollbackBtn';
import SearchInput from './SearchInput';

const Header = () => {
  return (
    <div className="container-fluid row p-1 mx-0">
      <div className="mr-1">
        <RollbackBtn />
      </div>
      <div className="col mr-1 px-0">
        <SearchInput />
      </div>
      <div>
        <ListDisplayModalSwitch />
      </div>
    </div>
  )
}

const Sider = (
  <Fragment>
    <Header />
    <DocList />
    <DelModal />
  </Fragment>
)


const Content = (
  <ContentLayout className="border-left">
    <EditPage />
  </ContentLayout>
)

const CloudDocPage = () => {
  return (
    <SiderLayout
      sider={Sider}
      content={Content}
    />
  )
}

export default CloudDocPage;