import 'sanitize.css/sanitize.css';
import './index.css';

import store, { history } from './store';

import App from './oldStructure/containers/app';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { render } from 'react-dom';

render(
  <ReduxProvider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <App />
      </div>
    </ConnectedRouter>
  </ReduxProvider>,
  document.querySelector('#root')
);
