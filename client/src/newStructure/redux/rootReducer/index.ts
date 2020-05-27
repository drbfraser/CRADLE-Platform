import { LOGOUT_USER } from '../../shared/reducers/user/currentUser';
import { allPatientsStatisticsReducer } from '../../shared/reducers/allPatientsStatistics';
import { chatReducer } from '../../pages/videoChat/reducers/chat';
import { combineReducers } from 'redux';
import { newReadingStatusReducer } from '../../shared/reducers/newReadingStatus';
import { patientsReducer } from '../../shared/reducers/patients';
import { referralsReducer } from '../../shared/reducers/referrals';
import { selectedPatientStatisticsReducer } from '../../shared/reducers/selectedPatientStatistics';
import { userReducer } from '../../shared/reducers/user';
import {healthFacility} from '../../shared/reducers/healthFacilities'

const appReducer = combineReducers({
  chat: chatReducer,
  newReading: newReadingStatusReducer,
  patients: patientsReducer,
  patientStats: selectedPatientStatisticsReducer,
  referrals: referralsReducer,
  statistics: allPatientsStatisticsReducer,
  user: userReducer,
  healthFacilities:healthFacility
});

export const rootReducer = (state: any, action: any) => {
  switch (action.type) {
    case LOGOUT_USER:
      return undefined;
    default:
      return appReducer(state, action);
  }
};
