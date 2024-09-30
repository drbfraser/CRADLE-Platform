import {
  HealthFacilitiesState,
  healthFacilitiesReducer,
} from '../reducers/healthFacilities';
import { createBrowserHistory } from 'history';
import { UserState, userReducer } from '../reducers/user';
import { MessageState } from '../reducers/message/messageReducer';
import { CurrentUserActionEnum } from '../reducers/user/currentUser';
import { combineReducers } from 'redux';
import { messageReducer } from '../reducers/message/messageReducer';
import { SecretKeyState, secretKeyReducer } from './secretKey';
import { SidebarState, sidebarSlice } from '../sidebar-state';

export type ReduxState = {
  healthFacilities: HealthFacilitiesState;
  user: UserState;
  message: MessageState;
  secretKey: SecretKeyState;
  drawer: SidebarState;
};

const createRootReducer = () => {
  return combineReducers({
    healthFacilities: healthFacilitiesReducer,
    user: userReducer,
    message: messageReducer,
    secretKey: secretKeyReducer,
    sidebar: sidebarSlice.reducer,
  });
};

export const history = createBrowserHistory();

export const rootReducer = (state: any, action: any) => {
  if (action.type === CurrentUserActionEnum.LOGOUT_USER) {
    state = undefined;
  }

  return createRootReducer()(state, action);
};
