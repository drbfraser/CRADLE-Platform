import { ChatState, chatReducer } from '../../pages/videoChat/reducers/chat';
import {
  HealthFacilitiesState,
  healthFacilitiesReducer,
} from '../../shared/reducers/healthFacilities';
import {
  NewReadingStatusState,
  newReadingStatusReducer,
} from '../../shared/reducers/newReadingStatus';
import {
  PatientStatisticsState,
  patientStatisticsReducer,
} from '../../shared/reducers/patientStatistics';
import { PatientsState, patientsReducer } from '../../shared/reducers/patients';
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
import { RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';

export type ReduxState = {
  chat: ChatState;
  healthFacilities: HealthFacilitiesState;
  newReadingStatus: NewReadingStatusState;
  patients: PatientsState;
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
  patients: patientsReducer,
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
