
import { configure } from 'mobx';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.scss';

// Mobx严格模式
configure({ enforceActions: 'always' })

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);