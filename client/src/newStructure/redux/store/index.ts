import * as History from 'history';

import { applyMiddleware, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { requestMiddleware } from '../middleware/request';
import { rootReducer } from '../rootReducer';
import thunk from 'redux-thunk';

const composeEnhancers = composeWithDevTools({ trace: true, traceLimit: 25 });

export const history = History.createBrowserHistory();
const reducer = connectRouter(history)(rootReducer);

const preloadedState = {};

const middleware = [thunk, routerMiddleware(history), requestMiddleware()];

export const reduxStore = createStore(
  reducer,
  preloadedState,
  composeEnhancers(applyMiddleware(...middleware))
);
