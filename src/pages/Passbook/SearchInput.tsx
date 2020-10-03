import { Input } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { PassbookStore } from 'src/store/PassbookStore';

const { Search } = Input;

interface ISearchInputProps extends React.PropsWithChildren<React.FC> {
  PassbookStore: PassbookStore
}

const SearchInput: React.FC = (props: ISearchInputProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.PassbookStore.search(e.target.value)
  }
  return (
    <Search
      placeholder="输入检索信息"
      onChange={onChange}
      className="container-fluid mx-0 px-2 mt-2 h-auto"
    />
  )
}

export default inject('PassbookStore')(observer(SearchInput));