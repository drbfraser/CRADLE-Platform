// import all the actions here

import {
  GET_SELECTEDPATIENTSTATS,
  GET_SELECTEDPATIENTSTATS_REQUESTED,
  GET_SELECTEDPATIENTSTATS_ERR
} from '../actions/statistics'

const initialState = {
  selectedPatientStatsList: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_SELECTEDPATIENTSTATS:
      //console.log(action.payload)
      return {
        ...state,
        selectedPatientStatsList: action.payload.data
      }

    case GET_SELECTEDPATIENTSTATS_REQUESTED:
      return {
        ...state,
        isLoading: true
      }

    case GET_SELECTEDPATIENTSTATS_ERR:
      return {
        ...state,
        isLoading: false
      }

    default:
      return state
  }
}
