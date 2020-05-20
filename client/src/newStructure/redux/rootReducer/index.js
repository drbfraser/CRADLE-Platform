import { LOGOUT_USER, userReducer } from '../../shared/reducers/user';

import { combineReducers } from 'redux';
import { patientsReducer } from '../../shared/reducers/patients';

const appReducer = combineReducers({
  user: userReducer,
  patients: patientsReducer,
});

export const rootReducer = (state, action) => {
  switch (action.type) {
    case LOGOUT_USER:
      return undefined;
    default:
      return appReducer(state, action);
  }
};
