import { LOGOUT_USER } from '../../shared/reducers/user/currentUser';
import { allPatientsStatisticsReducer } from '../../shared/reducers/allPatientsStatistics';
import { chatReducer, ChatState } from '../../pages/videoChat/reducers/chat';
import { combineReducers } from 'redux';
import { newReadingStatusReducer, NewReadingStatusState } from '../../shared/reducers/newReadingStatus';
import { patientsReducer } from '../../shared/reducers/patients';
import { referralsReducer } from '../../shared/reducers/referrals';
import { selectedPatientStatisticsReducer } from '../../shared/reducers/selectedPatientStatistics';
import { userReducer } from '../../shared/reducers/user';
import { PatientsState, patientsReducerV2 } from '../../shared/reducers/patientsV2';
import { PatientState, patientReducer } from '../../shared/reducers/patient';

export type ReduxState = {
  chat: ChatState;
  newReadingStatus: NewReadingStatusState;
  patient: PatientState;
  patients: any;
  patientsV2: PatientsState;
  patientStats: any;
  referrals: any;
  statistics: any;
  user: any;
};

const appReducer = combineReducers({
  chat: chatReducer,
  newReadingStatus: newReadingStatusReducer,
  patient: patientReducer,
  patients: patientsReducer,
  patientsV2: patientsReducerV2,
  patientStats: selectedPatientStatisticsReducer,
  referrals: referralsReducer,
  statistics: allPatientsStatisticsReducer,
  user: userReducer,
});

export const rootReducer = (state: any, action: any) => {
  switch (action.type) {
    case LOGOUT_USER:
      return undefined;
    default:
      return appReducer(state, action);
  }
};
