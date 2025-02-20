import { UserState, userReducer } from '../reducers/user';
import { CurrentUserActionEnum } from '../reducers/user/currentUser';
import { combineReducers } from 'redux';
import { SecretKeyState, secretKeyReducer } from './secretKey';
import { SidebarState, sidebarSlice } from '../sidebar-state';

export type ReduxState = {
  user: UserState;
  secretKey: SecretKeyState;
  drawer: SidebarState;
};

const createRootReducer = () => {
  return combineReducers({
    user: userReducer,
    secretKey: secretKeyReducer,
    sidebar: sidebarSlice.reducer,
  });
};

export const rootReducer = (state: any, action: any) => {
  if (action.type === CurrentUserActionEnum.LOGOUT_USER) {
    state = undefined;
  }

  return createRootReducer()(state, action);
};
