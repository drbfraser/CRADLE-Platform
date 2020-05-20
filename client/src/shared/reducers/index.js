import { LOGOUT_USER } from './user';
import chat from '../../reducers/chat';
import { combineReducers } from 'redux';
import counter from '../../reducers/counter';
import healthFacilities from '../../reducers/healthFacilities';
import newReading from '../../reducers/newReading';
import patientStats from '../../reducers/patientStats';
import { patientsReducer } from './patients';
import posts from '../../reducers/posts';
import referrals from '../../reducers/referrals';
import statistics from '../../reducers/statistics';
import { userReducer } from './user';

const appReducer = combineReducers({
  counter,
  posts,
  user: userReducer,
  patients: patientsReducer,
  statistics,
  referrals,
  patientStats,
  healthFacilities,
  newReading,
  chat,
});

export const rootReducer = (state, action) => {
  switch (action.type) {
    case LOGOUT_USER:
      return undefined;
    default:
      return appReducer(state, action);
  }
};
