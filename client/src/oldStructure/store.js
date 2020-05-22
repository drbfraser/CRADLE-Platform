import * as History from 'history';

import { applyMiddleware, compose, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import requestMiddleware from './middlewares/requestMiddleware';
import rootReducer from './reducers';
import thunk from 'redux-thunk';

export const history = History.createBrowserHistory();

const initialState = {};
const enhancers = [];
const middleware = [thunk, routerMiddleware(history), requestMiddleware()];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

export default createStore(
  connectRouter(history)(rootReducer),
  initialState,
  composedEnhancers
);
