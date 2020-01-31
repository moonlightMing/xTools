import { Input } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { CloudDocStore } from 'src/store/CloudDocStore';

const { Search } = Input;

interface ISearchInputProps extends React.Props<React.SFC> {
  CloudDocStore: CloudDocStore
}

const SearchInput: React.SFC = (props: ISearchInputProps) => {

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === '') {
      props.CloudDocStore.setCurSearchKey('');
      props.CloudDocStore.flushDocList()
    }
  }

  const onSearch = (value: string) => {
    props.CloudDocStore.searchDocTitle(value)
  }

  return (
    <Search
      allowClear={true}
      onChange={onChange}
      onSearch={onSearch}
    />
  )
}

export default inject('CloudDocStore')(observer(SearchInput));