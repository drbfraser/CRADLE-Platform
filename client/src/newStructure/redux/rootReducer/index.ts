import { LOGOUT_USER } from '../../shared/reducers/user/currentUser';
import { allPatientsStatisticsReducer } from '../../shared/reducers/allPatientsStatistics';
import { combineReducers } from 'redux';
import { newReadingStatusReducer } from '../../shared/reducers/newReadingStatus';
import { patientsReducer } from '../../shared/reducers/patients';
import { referralsReducer } from '../../shared/reducers/referrals';
import { selectedPatientStatisticsReducer } from '../../shared/reducers/selectedPatientStatistics';
import { userReducer } from '../../shared/reducers/user';

const appReducer = combineReducers({
  newReading: newReadingStatusReducer,
  patients: patientsReducer,
  patientStats: selectedPatientStatisticsReducer,
  referrals: referralsReducer,
  statistics: allPatientsStatisticsReducer,
  user: userReducer,
});

export const rootReducer = (state, action) => {
  switch (action.type) {
    case LOGOUT_USER:
      return undefined;
    default:
      return appReducer(state, action);
  }
};
