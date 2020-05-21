import 'sanitize.css/sanitize.css';
import './index.css';

// * Using new structure
// * Comment out lines 17 and 18 and uncomment 6 and 8
import { history, reduxStore as store } from './newStructure/redux/store';

import { App } from './newStructure/app';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { render } from 'react-dom';

/*
// * Using old structure
// * Comment out lines 5 and 7 and uncomment below
import store, { history } from './oldStructure/store';
import App from './oldStructure/containers/app';
*/


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
