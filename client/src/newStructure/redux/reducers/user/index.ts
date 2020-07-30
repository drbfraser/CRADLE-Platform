import { allUsersReducer, AllUsersState } from './allUsers';
import { allVhtsReducer, AllVhtsState } from './allVhts';
import { combineReducers } from 'redux';
import { currentUserReducer, CurrentUserState } from './currentUser';
import { registerStatusReducer, RegisterStatusState } from './registerStatus';

export type UserState = {
  allUsers: AllUsersState;
  allVhts: AllVhtsState;
  current: CurrentUserState;
  registerStatus: RegisterStatusState;
};

export const userReducer = combineReducers({
  current: currentUserReducer,
  registerStatus: registerStatusReducer,
  allUsers: allUsersReducer,
  allVhts: allVhtsReducer,
});
