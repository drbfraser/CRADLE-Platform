import { Endpoints } from '../../../server/endpoints';
import { serverRequestActionCreator } from '../utils';

const GET_STATISTICS_SUCCESS = `statistics/GET_STATISTICS_SUCCESS`;
const GET_STATISTICS_ERROR = `statistics/GET_STATISTICS_ERROR`;

export const getStatistics = () => {
  return serverRequestActionCreator({
    endpoint: Endpoints.STATS,
    onSuccess: (response: any) => ({
      type: GET_STATISTICS_SUCCESS,
      payload: response,
    }),
    onError: (error: any) => ({
      type: GET_STATISTICS_ERROR,
      payload: error,
    }),
  });
};

const initialState = {
  statisticsList: [],
};

export const allPatientsStatisticsReducer = (
  state = initialState, 
  action: any
) => {
  switch (action.type) {
    case GET_STATISTICS_SUCCESS:
      return {
        ...state,
        statisticsList: action.payload.data,
      };

    case GET_STATISTICS_ERROR:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};
