import * as History from 'history';

import { applyMiddleware, compose, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import { requestMiddleware } from '../middleware/request';
import { rootReducer } from '../rootReducer';
import thunk from 'redux-thunk';

const enhancersToCompose = [];
if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
  
  if (typeof devToolsExtension === 'function') {
    enhancersToCompose.push(devToolsExtension());
  }
}

export const history = History.createBrowserHistory();
const reducer = connectRouter(history)(rootReducer);

const preloadedState = {};

const middleware = [
  thunk, 
  routerMiddleware(history), 
  requestMiddleware()
];
const enhancer = compose(
  applyMiddleware(...middleware), 
  ...enhancersToCompose
);

export const reduxStore = createStore(
  reducer,
  preloadedState,
  enhancer
);
