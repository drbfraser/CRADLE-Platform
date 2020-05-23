import { Endpoint, Method } from '../api/constants';

import { requestActionCreator } from './api';

export const GET_HEALTH_FACILITY_SUCCESS = 'healthFacility/GET_HEALTH_FACILITY_SUCCESS'
export const GET_HEALTH_FACILITY_REQ  = 'healthFacility/GET_HEALTH_FACILITY_REQ'
export const GET_HEALTH_FACILITY_ERR = 'healthFacility/GET_HEALTH_FACILITY_ERR'

export const getHealthFacilityList = () => {
    return requestActionCreator(
        Endpoint.HEALTH_FACILITY_LIST,
        Method.GET,
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