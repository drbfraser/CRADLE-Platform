import {
  HealthFacilitiesState,
  healthFacilitiesReducer,
} from '../reducers/healthFacilities';
import { History, createBrowserHistory } from 'history';
import { UserState, userReducer } from '../reducers/user';

import { CurrentUserActionEnum } from '../reducers/user/currentUser';
import { RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

export type ReduxState = {
  healthFacilities: HealthFacilitiesState;
  user: UserState;
  router: RouterState;
};

const createRootReducer = (history: History) => {
  return combineReducers({
    healthFacilities: healthFacilitiesReducer,
    router: connectRouter(history),
    user: userReducer,
  });
};

export const history = createBrowserHistory();

export const rootReducer = (state: any, action: any) => {
  switch (action.type) {
    case CurrentUserActionEnum.LOGOUT_USER:
      return undefined;
    default:
      return createRootReducer(history)(state, action);
  }
};
