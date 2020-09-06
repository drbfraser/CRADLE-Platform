import { HealthFacility, OrNull, ServerError } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { EndpointEnum } from '../../../server';

enum HealthFacilitiesActionEnum {
  GET_HEALTH_FACILITY_REQUESTED = 'healthFacility/GET_HEALTH_FACILITY_REQUESTED',
  GET_HEALTH_FACILITY_SUCCESS = 'healthFacility/GET_HEALTH_FACILITY_SUCCESS',
  GET_HEALTH_FACILITY_ERROR = 'healthFacility/GET_HEALTH_FACILITY_ERROR',
  CLEAR_REQUEST_OUTCOME = 'healthFacility/CLEAR_REQUEST_OUTCOME',
}

type ErrorPayload = {
  message: string;
};

type HealthFacilitiesAction =
  | { type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUESTED }
  | {
      type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_SUCCESS;
      payload: { data: Array<string> };
    }
  | {
      type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_ERROR;
      payload: ErrorPayload;
    }
  | {
      type: HealthFacilitiesActionEnum.CLEAR_REQUEST_OUTCOME;
    };

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
        endpoint: EndpointEnum.HEALTH_FACILITY_LIST,
        onSuccess: ({
          data,
        }: {
          data: Array<HealthFacility>;
        }): HealthFacilitiesAction => ({
          type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_SUCCESS,
          payload: { data },
        }),
        onError: ({ message }: ServerError): HealthFacilitiesAction => {
          return {
            type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_ERROR,
            payload: { message },
          };
        },
      })
    );
  };
};

export const clearHealthFacilitiesRequestOutcome = () => ({
  type: HealthFacilitiesActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type HealthFacilitiesState = {
  isLoading: boolean;
  data: OrNull<Array<HealthFacility>>;
  error: OrNull<string>;
};

const initialState: HealthFacilitiesState = {
  isLoading: false,
  data: null,
  error: null,
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
        error: action.payload.message,
        isLoading: false,
      };
    case HealthFacilitiesActionEnum.CLEAR_REQUEST_OUTCOME:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
