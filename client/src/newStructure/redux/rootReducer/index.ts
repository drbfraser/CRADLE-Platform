import { ChatState, chatReducer } from '../../pages/videoChat/reducers/chat';
import {
  HealthFacilitiesState,
  healthFacilitiesReducer,
} from '../../shared/reducers/healthFacilities';
import { History, createBrowserHistory } from 'history';
import {
  PatientStatisticsState,
  patientStatisticsReducer,
} from '../../shared/reducers/patientStatistics';
import { PatientsState, patientsReducer } from '../../shared/reducers/patients';
import { ReadingState, readingReducer } from '../../shared/reducers/reading';
import {
  StatisticsState,
  statisticsReducer,
} from '../../shared/reducers/statistics';
import { UserState, userReducer } from '../../shared/reducers/user';

import { CurrentUserActionEnum } from '../../shared/reducers/user/currentUser';
import { RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

export type ReduxState = {
  chat: ChatState;
  healthFacilities: HealthFacilitiesState;
  reading: ReadingState;
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
    reading: readingReducer,
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
