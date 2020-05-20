import { allUsersReducer } from './allUsers';
import { allVhtsReducer } from './allVhts';
import { combineReducers } from 'redux';
import { currentUserReducer } from './currentUser';
import { registerStatusReducer } from './registerStatus';
import { serverLoginErrorMessageReducer } from './serverLoginErrorMessage';

export const userReducer = combineReducers({
  currentUser: currentUserReducer,
  registerStatus: registerStatusReducer,
  allUsers: allUsersReducer,
  allVhts: allVhtsReducer,
  serverLoginErrorMessage: serverLoginErrorMessageReducer,
});
