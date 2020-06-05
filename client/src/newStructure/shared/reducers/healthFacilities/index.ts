import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Endpoints } from '../../../server/endpoints';

enum HealthFacilitiesActionEnum {
  GET_HEALTH_FACILITY_SUCCESS = 'healthFacility/GET_HEALTH_FACILITY_SUCCESS',
  GET_HEALTH_FACILITY_REQUEST  = 'healthFacility/GET_HEALTH_FACILITY_REQUEST',
  GET_HEALTH_FACILITY_ERROR = 'healthFacility/GET_HEALTH_FACILITY_ERROR',
}

type HealthFacilitiesAction = 
  | { type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_SUCCESS, payload: { data: any } }
  | { type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUEST  }
  | { type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_ERROR };

export const getHealthFacilityList = (): ServerRequestAction => {
  return serverRequestActionCreator({
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
}

export const getHealthFacilityListRequested = (): HealthFacilitiesAction => ({
  type: HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUEST
});

export type HealthFacilitiesState = {
  isLoading: boolean;
  data: Array<any>;
};

const initialState: HealthFacilitiesState = {
  data: [],
  isLoading: false,
};

export const healthFacilitiesReducer =  (
  state = initialState, 
  action: HealthFacilitiesAction
): HealthFacilitiesState => {
  switch (action.type) {
    case HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_SUCCESS:
      return {
        ...initialState,
        data: action.payload.data
      };
    case HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_REQUEST:
      return {
        ...state,
        isLoading: true
      };
    case HealthFacilitiesActionEnum.GET_HEALTH_FACILITY_ERROR:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
}