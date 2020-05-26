import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { serverRequestActionCreator } from '../utils';

export const GET_HEALTH_FACILITY_SUCCESS = 'healthFacility/GET_HEsUCCESS'
export const GET_HEALTH_FACILITY_REQ  = 'healthFacility/GET_HEALTH_FACILITY_REQ'
export const GET_HEALTH_FACILITY_ERR = 'healthFacility/GET_HEALTH_FACILITY_ERR'

export const getHealthFacilityList = () => {
  return serverRequestActionCreator(
    Endpoints.HEALTH_FACILITY_LIST,
    Methods.GET,
    null,
    getHealthFacilityListOnSuccess,
    getHealthFacilityListOnError
  )
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
