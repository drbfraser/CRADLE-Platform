import { CurrentUserState, currentUserReducer } from './currentUser';

import { combineReducers } from 'redux';

export type UserState = {
  current: CurrentUserState;
};

export const userReducer = combineReducers({
  current: currentUserReducer,
});
