// import all the actions here

import {
    GET_SELECTED_PATIENTS_STATS,
    GET_SELECTED_PATIENTS_STATS_ERR,
    GET_SELECTED_PATIENTS_STATS_REQUESTED
} from '../actions/statistics';

const initialState = {
  selectedPatientStatsList: []
}

export default (state = initialState, action) => {
  switch (action.type) {
        case GET_SELECTED_PATIENTS_STATS:
            //console.log(action.payload)
            return {
                ...state,
                selectedPatientStatsList: action.payload.data
            }

        case GET_SELECTED_PATIENTS_STATS_REQUESTED:
            return {
                ...state,
                isLoading: true
            }

        case GET_SELECTED_PATIENTS_STATS_ERR:
            return {
                ...state,
                isLoading: false
            }

        default:
            return state
    }
}
