import { LOGOUT_USER } from '../../shared/reducers/user/currentUser';
import { statisticsReducer, StatisticsState } from '../../shared/reducers/statistics';
import { chatReducer, ChatState } from '../../pages/videoChat/reducers/chat';
import { combineReducers } from 'redux';
import { newReadingStatusReducer, NewReadingStatusState } from '../../shared/reducers/newReadingStatus';
import { patientsReducer, PatientsState } from '../../shared/reducers/patients';
import { referralsReducer } from '../../shared/reducers/referrals';
import { patientStatisticsReducer, PatientStatisticsState } from '../../shared/reducers/patientStatistics';
import { userReducer, UserState } from '../../shared/reducers/user';
import { PatientsV2State, patientsReducerV2 } from '../../shared/reducers/patientsV2';
import { PatientState, patientReducer } from '../../shared/reducers/patient';
import { healthFacilitiesReducer } from '../../shared/reducers/healthFacilities';

export type ReduxState = {
  chat: ChatState;
  healthFacilities: any;
  newReadingStatus: NewReadingStatusState;
  patient: PatientState;
  patients: PatientsState;
  patientsV2: PatientsV2State;
  patientStatistics: PatientStatisticsState;
  referrals: any;
  statistics: StatisticsState;
  user: UserState;
};

const appReducer = combineReducers({
  chat: chatReducer,
  healthFacilities: healthFacilitiesReducer,
  newReadingStatus: newReadingStatusReducer,
  patient: patientReducer,
  patients: patientsReducer,
  patientsV2: patientsReducerV2,
  patientStatistics: patientStatisticsReducer,
  referrals: referralsReducer,
  statistics: statisticsReducer,
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
