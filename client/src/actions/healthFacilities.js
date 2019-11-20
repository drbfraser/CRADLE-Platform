import axios from 'axios';

import BASE_URL from '../serverUrl'

export const GET_HEALTHFACILITY_SUCCESS = 'healthFacility/GET_HEALTHFACILITY_SUCCESS'
export const GET_HEALTHFACILITY_REQ  = 'healthFacility/GET_HEALTHFACILITY_REQ'
export const GET_HEALTHFACILITY_ERR = 'healthFacility/GET_HEALTHFACILITY_ERR'

export const getHealthFacilityList = () => {
    return dispatch => {
        dispatch({
            type: GET_HEALTHFACILITY_REQ
        })

        return axios.get(BASE_URL + "/health_facility_list").then((res) => {
            dispatch({
                type: GET_HEALTHFACILITY_SUCCESS,
                payload: res.data
            })
        }).catch(err => {
            console.log(err);
            dispatch({
                type: GET_HEALTHFACILITY_ERR
            })
        })
    }
}