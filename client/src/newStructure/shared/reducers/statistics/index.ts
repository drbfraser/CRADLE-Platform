import { Endpoints } from '../../../server/endpoints';
import { serverRequestActionCreator, ServerRequestAction } from '../utils';
import { Callback, OrNull } from '@types';

enum StatisticsActionEnum {
  CLEAR_REQUEST_OUTCOME = 'statistics/CLEAR_REQUEST_OUTCOME',
  GET_STATISTICS_SUCCESS = 'statistics/GET_STATISTICS_SUCCESS',
  GET_STATISTICS_ERROR = 'statistics/GET_STATISTICS_ERROR',
  START_REQUEST = 'statistics/START_REQUEST',
}

type StatisticsAction = 
  | { type: StatisticsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: StatisticsActionEnum.GET_STATISTICS_ERROR, payload: { message: string } }
  | { type: StatisticsActionEnum.GET_STATISTICS_SUCCESS, payload: { data: any } }
  | { type: StatisticsActionEnum.START_REQUEST };

const startRequest = (): StatisticsAction => ({
  type: StatisticsActionEnum.START_REQUEST
});

type StatisticsRequest = Callback<Callback<StatisticsAction>, ServerRequestAction>;

export const getStatistics = (): StatisticsRequest => {
  return (dispatch: Callback<StatisticsAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: Endpoints.STATS,
      onSuccess: (data: any): StatisticsAction => ({
        type: StatisticsActionEnum.GET_STATISTICS_SUCCESS,
        payload: { data },
      }),
      onError: (message: string): StatisticsAction => ({
        type: StatisticsActionEnum.GET_STATISTICS_ERROR,
        payload: { message },
      })
    })
  };
};

export const clearStatisticsRequestOutcome = (): StatisticsAction => ({
  type: StatisticsActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type StatisticsState = {
  data: OrNull<any>;
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
}

const initialState: StatisticsState = {
  data: null,
  error: false,
  loading: false,
  message: null,
};

export const statisticsReducer = (
  state = initialState, 
  action: StatisticsAction
): StatisticsState => {
  switch (action.type) {
    case StatisticsActionEnum.CLEAR_REQUEST_OUTCOME: 
      return { ...initialState, data: state.data };
    case StatisticsActionEnum.GET_STATISTICS_SUCCESS:
      return {
        ...initialState,
        data: action.payload.data,
      };
    case StatisticsActionEnum.GET_STATISTICS_ERROR:
      return {
        ...initialState,
        error: true,
        message: action.payload.message,
      };
    case StatisticsActionEnum.START_REQUEST:
      return { ...initialState, loading: true };
    default:
      return state;
  }
};
