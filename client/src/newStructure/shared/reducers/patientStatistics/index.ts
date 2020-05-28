import { Endpoints } from '../../../server/endpoints';
import { serverRequestActionCreator, ServerRequestAction } from '../utils';
import { Callback, OrNull } from '@types';

enum PatientStatisticsActionEnum {
  CLEAR_REQUEST_OUTCOME = 'patientStatistics/CLEAR_REQUEST_OUTCOME',
  START_REQUEST = 'patientStatistics/START_REQUEST',
  GET_PATIENT_STATISTICS_ERROR = 'patientStatistics/GET_PATIENT_STATISTICS_ERROR',
  GET_PATIENT_STATISTICS_SUCCESS = 'patientStatistics/GET_PATIENT_STATISTICS_SUCCESS',
}

type PatientStatisticsAction = 
  | { type: PatientStatisticsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: PatientStatisticsActionEnum.START_REQUEST }
  | { type: PatientStatisticsActionEnum.GET_PATIENT_STATISTICS_ERROR, payload: { message: string } }
  | { type: PatientStatisticsActionEnum.GET_PATIENT_STATISTICS_SUCCESS, payload: { data: any } };

const startRequest = (): PatientStatisticsAction => ({
  type: PatientStatisticsActionEnum.START_REQUEST,
})

type PatientStatisticsRequest = Callback<Callback<PatientStatisticsAction>, ServerRequestAction>;

export const getPatientStatistics = (patientId: string): PatientStatisticsRequest => {
  return (dispatch: Callback<PatientStatisticsAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: `${Endpoints.PATIENT}${Endpoints.STATS}/${patientId}`,
      onSuccess: (data: any): PatientStatisticsAction => ({
        type: PatientStatisticsActionEnum.GET_PATIENT_STATISTICS_SUCCESS,
        payload: { data }
      }),
      onError: (message: string): PatientStatisticsAction => ({
        type: PatientStatisticsActionEnum.GET_PATIENT_STATISTICS_ERROR,
        payload: { message },
      }),
    })
  };
};

export const clearPatientStatisticsRequestOutcome = (): PatientStatisticsAction => ({
  type: PatientStatisticsActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type PatientStatisticsState = {
  data: OrNull<any>;
  error: boolean,
  loading: boolean,
  message: OrNull<string>,
}

const initialState: PatientStatisticsState = {
  data: null,
  error: false,
  loading: false,
  message: null,
};

export const patientStatisticsReducer = (
  state = initialState, 
  action: PatientStatisticsAction
): PatientStatisticsState => {
  switch (action.type) {
    case PatientStatisticsActionEnum.CLEAR_REQUEST_OUTCOME:
      return { ...initialState, data: state.data };

    case PatientStatisticsActionEnum.GET_PATIENT_STATISTICS_SUCCESS:
      return {
        ...initialState,
        data: action.payload.data,
      };

    case PatientStatisticsActionEnum.START_REQUEST:
      return {
        ...initialState,
        loading: true,
      };

    case PatientStatisticsActionEnum.GET_PATIENT_STATISTICS_ERROR:
      return {
        ...initialState,
        error: true,
        message: action.payload.message,
      };

    default:
      return state;
  }
};