import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../server/endpoints';

enum HealthFacilitiesActionEnum {
  GET_HEALTH_FACILITY_REQUESTED = 'healthFacility/GET_HEALTH_FACILITY_REQUESTED',
  GET_HEALTH_FACILITY_SUCCESS = 'healthFacility/GET_HEALTH_FACILITY_SUCCESS',
  GET_HEALTH_FACILITY_ERROR = 'healthFacility/GET_HEALTH_FACILITY_ERROR',
}

type HealthFacilitiesAction =
  | { type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUESTED }
  | {
      type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_SUCCESS;
      payload: { data: any };
    }
  | { type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_ERROR };

const getHealthFacilityListRequested = (): HealthFacilitiesAction => ({
  type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUESTED,
});

export const getHealthFacilityList = (): ((
  dispatch: Dispatch
) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(getHealthFacilityListRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: Endpoints.HEALTH_FACILITY_LIST,
        onSuccess: ({ data }: { data: any }): HealthFacilitiesAction => ({
          type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_SUCCESS,
          payload: { data },
        }),
        onError: (error): HealthFacilitiesAction => {
          console.error(error);
          return {
            type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_ERROR,
          };
        },
      })
    );
  };
};

export type HealthFacilitiesState = {
  isLoading: boolean;
  data: Array<any>;
};

const initialState: HealthFacilitiesState = {
  data: [],
  isLoading: false,
};

export const healthFacilitiesReducer = (
  state = initialState,
  action: HealthFacilitiesAction
): HealthFacilitiesState => {
  switch (action.type) {
    case HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_SUCCESS:
      return {
        ...initialState,
        data: action.payload.data,
      };
    case HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };
    case HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_ERROR:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};
