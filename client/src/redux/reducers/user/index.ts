import { AllUsersState, allUsersReducer } from './allUsers';
import { AllVhtsState, allVhtsReducer } from './allVhts';
import { CurrentUserState, currentUserReducer } from './currentUser';

import { combineReducers } from 'redux';

export type UserState = {
  allUsers: AllUsersState;
  allVhts: AllVhtsState;
  current: CurrentUserState;
};

export const userReducer = combineReducers({
  current: currentUserReducer,
  allUsers: allUsersReducer,
  allVhts: allVhtsReducer,
});
