import { HealthFacility, OrNull, ServerError } from 'src/shared/types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { EndpointEnum } from 'src/shared/enums';

// Define action types for health facilities
enum HealthFacilitiesActionEnum {
  GET_HEALTH_FACILITY_REQUESTED = 'healthFacility/GET_HEALTH_FACILITY_REQUESTED',
  GET_HEALTH_FACILITY_SUCCESS = 'healthFacility/GET_HEALTH_FACILITY_SUCCESS',
  GET_HEALTH_FACILITY_ERROR = 'healthFacility/GET_HEALTH_FACILITY_ERROR',
  CLEAR_REQUEST_OUTCOME = 'healthFacility/CLEAR_REQUEST_OUTCOME',
}

// Define action payloads
type ErrorPayload = {
  message: string;
};

// Define action objects with their corresponding payloads
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

// Action creators
const getHealthFacilityListRequested = (): HealthFacilitiesAction => ({
  type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUESTED,
});

// Async action creator to get health facility list
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

// Action creator to clear health facilities request outcome
export const clearHealthFacilitiesRequestOutcome = () => ({
  type: HealthFacilitiesActionEnum.CLEAR_REQUEST_OUTCOME,
});

// Define the HealthFacilitiesState type
export type HealthFacilitiesState = {
  isLoading: boolean;
  data: OrNull<Array<HealthFacility>>;
  error: OrNull<string>;
};

// Initial state for the health facilities reducer
const initialState: HealthFacilitiesState = {
  isLoading: false,
  data: null,
  error: null,
};

// healthFacilitiesReducer handles actions and updates the state accordingly
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
