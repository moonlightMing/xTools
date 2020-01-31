import { inject, observer } from 'mobx-react';
import React from 'react';
import ContentLayout from 'src/layout/ContentLayout';
import SiderLayout from 'src/layout/SiderLayout';
import { PassbookStore } from 'src/store/PassbookStore';
import AddFolderFormModal from './AddFolderFormModal';
import AddNodeFormModal from './AddNodeFormModal';
import BottomBtn from './BottomBtn';
import DelFormModal from './DelFormModal';
import DirTag from './DirTag';
import EditNodeFormModal from './EditNodeFormModal';
import MsgList from './MsgList';
import SearchInput from './SearchInput';
import TreeDisplay from './TreeDisplay';

interface ISiderProps extends React.Props<React.SFC> {
  PassbookStore: PassbookStore
}

const Sider: React.SFC = inject('PassbookStore')(observer(((props: ISiderProps) => (
  <div
    // tslint:disable-next-line: jsx-no-lambda
    onMouseEnter={() => props.PassbookStore.setDirTagVisible(true)}
    // tslint:disable-next-line: jsx-no-lambda
    onMouseLeave={() => props.PassbookStore.setDirTagVisible(false)}
  >
    <SearchInput />
    <TreeDisplay />
    <BottomBtn />
  </div>
))))

const Content = () => (
  <ContentLayout className="border-left">
    {/* 内容展示 */}
    <MsgList />
    <DirTag />

    {/* 表格遮罩 */}
    <AddFolderFormModal />
    <AddNodeFormModal />
    <DelFormModal />
    <EditNodeFormModal />
  </ContentLayout >
)


const PassbookPage = () => (
  <SiderLayout
    sider={<Sider />}
    content={<Content />}
  />
)

export default PassbookPage;