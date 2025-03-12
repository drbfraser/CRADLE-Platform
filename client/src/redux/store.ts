import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { userSlice } from './user-state';
import { sidebarSlice } from './sidebar-state';

const preloadedState = {};

const middleware = [thunk];

export const reduxStore = configureStore({
  reducer: {
    user: userSlice.reducer,
    sidebar: sidebarSlice.reducer,
  },
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
