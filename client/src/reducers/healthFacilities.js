// import all the actions here

import {
  GET_HEALTHFACILITY_SUCCESS,
  GET_HEALTHFACILITY_REQ,
  GET_HEALTHFACILITY_ERR
} from '../actions/healthFacilities'

const initialState = {
  statisticsList: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_HEALTHFACILITY_SUCCESS:
      return {
        ...state,
        healthFacilitiesList: action.payload.data
      }

    case GET_HEALTHFACILITY_REQ:
      return {
        ...state,
        isLoading: true
      }

    case GET_HEALTHFACILITY_ERR:
      return {
        ...state,
        isLoading: false
      }

    default:
      return state
  }
}
