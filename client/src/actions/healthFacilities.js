import { requestActionCreator } from './api';
import { Endpoint, Method } from '../api/constants';

export const GET_HEALTHFACILITY_SUCCESS = 'healthFacility/GET_HEALTHFACILITY_SUCCESS'
export const GET_HEALTHFACILITY_REQ  = 'healthFacility/GET_HEALTHFACILITY_REQ'
export const GET_HEALTHFACILITY_ERR = 'healthFacility/GET_HEALTHFACILITY_ERR'

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
    type: GET_HEALTHFACILITY_REQ
})

const getHealthFacilityListOnSuccess = response => ({
    type: GET_HEALTHFACILITY_SUCCESS,
    payload: response
})

const getHealthFacilityListOnError = error => ({
    type: GET_HEALTHFACILITY_ERR,
    payload: error
})