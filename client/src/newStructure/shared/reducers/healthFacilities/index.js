import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { serverRequestActionCreator } from '../utils';

export const GET_HEALTH_FACILITY_SUCCESS = 'healthFacility/GET_HEALTH_FACILITY_SUCCESS'
export const GET_HEALTH_FACILITY_REQ  = 'healthFacility/GET_HEALTH_FACILITY_REQ'
export const GET_HEALTH_FACILITY_ERR = 'healthFacility/GET_HEALTH_FACILITY_ERR'

export const getHealthFacilityList = () => {
  return serverRequestActionCreator({
    endpoint: Endpoints.HEALTH_FACILITY_LIST,
    onSuccess: (response) => ({
      type: GET_HEALTH_FACILITY_SUCCESS,
      payload: response,
    }),
    onError: (error) => ({
      type: GET_HEALTH_FACILITY_ERR,
      payload: error,
    }),  })
}

export const getHealthFacilityListRequested = () => ({
    type: GET_HEALTH_FACILITY_REQ
})

const getHealthFacilityListOnSuccess = response => ({
    type: GET_HEALTH_FACILITY_SUCCESS,
    payload: response
})

const getHealthFacilityListOnError = error => ({
    type: GET_HEALTH_FACILITY_ERR,
    payload: error
})


const initialState = {
statisticsList: []
}

export default (state = initialState, action) => {
  switch (action.type) {
      case GET_HEALTH_FACILITY_SUCCESS:
          return {
              ...state,
              healthFacilitiesList: action.payload.data
          }
      
      case GET_HEALTH_FACILITY_REQ:
          return {
              ...state,
              isLoading: true
          }

      case GET_HEALTH_FACILITY_ERR:
          return {
              ...state,
              isLoading: false
          }

  default:
    return state
}
}