import { allUsersReducer, AllUsersState } from './allUsers';
import { allVhtsReducer, AllVhtsState } from './allVhts';
import { combineReducers } from 'redux';
import { currentUserReducer, CurrentUserState } from './currentUser';
import { registerStatusReducer, RegisterStatusState } from './registerStatus';

export type UserState = {
  allUsers: AllUsersState;
  allVhts: AllVhtsState;
  currentUser: CurrentUserState,
  registerStatus: RegisterStatusState,
};

export const userReducer = combineReducers({
  currentUser: currentUserReducer,
  registerStatus: registerStatusReducer,
  allUsers: allUsersReducer,
  allVhts: allVhtsReducer,
});
