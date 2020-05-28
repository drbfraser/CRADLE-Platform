import { allUsersReducer, AllUsersState } from './allUsers';
import { allVhtsReducer } from './allVhts';
import { combineReducers } from 'redux';
import { currentUserReducer } from './currentUser';
import { registerStatusReducer } from './registerStatus';
import { serverLoginErrorMessageReducer } from './serverLoginErrorMessage';

export type UserState = {
  allUsers: AllUsersState;
};

export const userReducer = combineReducers({
  currentUser: currentUserReducer,
  registerStatus: registerStatusReducer,
  allUsers: allUsersReducer,
  allVhts: allVhtsReducer,
  serverLoginErrorMessage: serverLoginErrorMessageReducer,
});
