import 'sanitize.css/sanitize.css';
import './index.css';

// * Using new structure
import { history, reduxStore as store } from './newStructure/redux/store';

import { App } from './newStructure/app';
/*
Using old structure
import store, { history } from './oldStructure/store';
import App from './oldStructure/containers/app';
*/
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
