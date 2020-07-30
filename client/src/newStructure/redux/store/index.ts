import { applyMiddleware, createStore } from 'redux';
import { history, rootReducer } from '../reducers';

import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { requestMiddleware } from '../middleware/request';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';

const composeEnhancers = composeWithDevTools({ trace: true, traceLimit: 25 });

const preloadedState = {};

const middleware = [thunk, routerMiddleware(history), requestMiddleware()];

export const reduxStore = createStore(
  rootReducer,
  preloadedState,
  composeEnhancers(applyMiddleware(...middleware))
);
