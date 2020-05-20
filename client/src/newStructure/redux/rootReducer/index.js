import { LOGOUT_USER } from '../../shared/reducers/user/currentUser';
import { combineReducers } from 'redux';
import { patientsReducer } from '../../shared/reducers/patients';
import { userReducer } from '../../shared/reducers/user';

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
