// import all the actions here

import {
    GET_HEALTH_FACILITY_ERR,
    GET_HEALTH_FACILITY_REQ,
    GET_HEALTH_FACILITY_SUCCESS
} from '../actions/healthFacilities';

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
