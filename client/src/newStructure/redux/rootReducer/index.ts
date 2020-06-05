import { ChatState, chatReducer } from '../../pages/videoChat/reducers/chat';
import {
  HealthFacilitiesState,
  healthFacilitiesReducer,
} from '../../shared/reducers/healthFacilities';
import {
  NewReadingStatusState,
  newReadingStatusReducer,
} from '../../shared/reducers/newReadingStatus';
import { PatientState, patientReducer } from '../../shared/reducers/patient';
import {
  PatientStatisticsState,
  patientStatisticsReducer,
} from '../../shared/reducers/patientStatistics';
import { PatientsState, patientsReducer } from '../../shared/reducers/patients';
import {
  PatientsV2State,
  patientsReducerV2,
} from '../../shared/reducers/patientsV2';
import {
  ReferralsState,
  referralsReducer,
} from '../../shared/reducers/referrals';
import {
  StatisticsState,
  statisticsReducer,
} from '../../shared/reducers/statistics';
import { UserState, userReducer } from '../../shared/reducers/user';

import { CurrentUserActionEnum } from '../../shared/reducers/user/currentUser';
import { combineReducers } from 'redux';
import { RouterState } from 'connected-react-router';

export type ReduxState = {
  chat: ChatState;
  healthFacilities: HealthFacilitiesState;
  newReadingStatus: NewReadingStatusState;
  patient: PatientState;
  patients: PatientsState;
  patientsV2: PatientsV2State;
  patientStatistics: PatientStatisticsState;
  referrals: ReferralsState;
  statistics: StatisticsState;
  user: UserState;
  router: RouterState;
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
    case CurrentUserActionEnum.LOGOUT_USER:
      return undefined;
    default:
      return appReducer(state, action);
  }
};
