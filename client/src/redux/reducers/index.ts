import { ChatState, chatReducer } from '../../pages/videoChat/reducers/chat';
import {
  HealthFacilitiesState,
  healthFacilitiesReducer,
} from '../reducers/healthFacilities';
import { History, createBrowserHistory } from 'history';
import {
  NewReadingStatusState,
  newReadingStatusReducer,
} from '../reducers/newReadingStatus';
import {
  PatientStatisticsState,
  patientStatisticsReducer,
} from '../reducers/patientStatistics';
import { PatientsState, patientsReducer } from '../reducers/patients';
import { StatisticsState, statisticsReducer } from '../reducers/statistics';
import { UserState, userReducer } from '../reducers/user';

import { CurrentUserActionEnum } from '../reducers/user/currentUser';
import { RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

export type ReduxState = {
  chat: ChatState;
  healthFacilities: HealthFacilitiesState;
  newReadingStatus: NewReadingStatusState;
  patients: PatientsState;
  patientStatistics: PatientStatisticsState;
  statistics: StatisticsState;
  user: UserState;
  router: RouterState;
};

const createRootReducer = (history: History) => {
  return combineReducers({
    chat: chatReducer,
    healthFacilities: healthFacilitiesReducer,
    newReadingStatus: newReadingStatusReducer,
    patients: patientsReducer,
    patientStatistics: patientStatisticsReducer,
    router: connectRouter(history),
    statistics: statisticsReducer,
    user: userReducer,
  });
};

export const history = createBrowserHistory();

export const rootReducer = (state: any, action: any) => {
  switch (action.type) {
    case CurrentUserActionEnum.LOGOUT_USER:
      return undefined;
    default:
      return createRootReducer(history)(state, action);
  }
};
