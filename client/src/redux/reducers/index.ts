import {
  HealthFacilitiesState,
  healthFacilitiesReducer,
} from '../reducers/healthFacilities';
import { History, createBrowserHistory } from 'history';
import { UserState, userReducer } from '../reducers/user';
import { MessageState } from '../reducers/message/messageReducer';
import { CurrentUserActionEnum } from '../reducers/user/currentUser';
import { RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { messageReducer } from '../reducers/message/messageReducer';

// Define the ReduxState type, which represents the state shape of the entire Redux store
export type ReduxState = {
  healthFacilities: HealthFacilitiesState;
  user: UserState;
  router: RouterState;
  message: MessageState;
};

// createRootReducer function combines all the reducers in your application
const createRootReducer = (history: History) => {
  return combineReducers({
    healthFacilities: healthFacilitiesReducer,
    router: connectRouter(history),
    user: userReducer,
    message: messageReducer,
  });
};

// Create the browser history object for the application
export const history = createBrowserHistory();

// Define the rootReducer, which handles actions and returns the new state
// If the action type is LOGOUT_USER, it returns undefined to reset the state
// Otherwise, it calls the createRootReducer function with the current state and action
export const rootReducer = (state: any, action: any) => {
  switch (action.type) {
    case CurrentUserActionEnum.LOGOUT_USER:
      return undefined;
    default:
      return createRootReducer(history)(state, action);
  }
};