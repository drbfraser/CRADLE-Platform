import { OrNull, ServerError, Statistics } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../server/endpoints';

enum StatisticsActionEnum {
  CLEAR_REQUEST_OUTCOME = 'statistics/CLEAR_REQUEST_OUTCOME',
  GET_STATISTICS_REQUESTED = 'statistics/GET_STATISTICS_REQUESTED',
  GET_STATISTICS_SUCCESS = 'statistics/GET_STATISTICS_SUCCESS',
  GET_STATISTICS_ERROR = 'statistics/GET_STATISTICS_ERROR',
}

type StatisticsAction =
  | { type: StatisticsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: StatisticsActionEnum.GET_STATISTICS_REQUESTED }
  | {
      type: StatisticsActionEnum.GET_STATISTICS_ERROR;
      payload: { message: string };
    }
  | {
      type: StatisticsActionEnum.GET_STATISTICS_SUCCESS;
      payload: { data: any };
    };

const getStatsitcsRequest = (): StatisticsAction => ({
  type: StatisticsActionEnum.GET_STATISTICS_REQUESTED,
});

export const getStatistics = (): ((
  dispatch: Dispatch
) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(getStatsitcsRequest());

    return dispatch(
      serverRequestActionCreator({
        endpoint: Endpoints.STATS,
        onSuccess: ({ data }: any): StatisticsAction => ({
          type: StatisticsActionEnum.GET_STATISTICS_SUCCESS,
          payload: { data },
        }),
        onError: ({ message }: ServerError): StatisticsAction => ({
          type: StatisticsActionEnum.GET_STATISTICS_ERROR,
          payload: { message },
        }),
      })
    );
  };
};

export const clearStatisticsRequestOutcome = (): StatisticsAction => ({
  type: StatisticsActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type StatisticsState = {
  data: OrNull<Statistics>;
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
};

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
    case StatisticsActionEnum.GET_STATISTICS_REQUESTED:
      return { ...initialState, loading: true };
    default:
      return state;
  }
};
