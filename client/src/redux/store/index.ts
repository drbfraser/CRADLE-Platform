import { rootReducer } from '../reducers';

import { configureStore } from '@reduxjs/toolkit';
import { requestMiddleware } from '../middleware';
import thunk from 'redux-thunk';

const preloadedState = {};

const middleware = [thunk, requestMiddleware()];

export const reduxStore = configureStore({
  reducer: rootReducer,
  middleware: [...middleware],
  devTools: process.env.NODE_ENV !== 'production' && {
    trace: true,
    traceLimit: 25,
  },
  preloadedState,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof reduxStore.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof reduxStore.dispatch;
