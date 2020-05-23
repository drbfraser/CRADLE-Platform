// import all the actions here

import {
    GET_STATISTICS,
    GET_STATISTICS_REQUESTED,
    GET_STATISTICS_ERR
} from '../actions/statistics';

const initialState = {
    statisticsList: [],
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_STATISTICS:
            // console.log(action.payload)
            return {
                ...state,
                statisticsList: action.payload.data
            }
        
        case GET_STATISTICS_REQUESTED:
            return {
                ...state,
                isLoading: true
            }

        case GET_STATISTICS_ERR:
            return {
                ...state,
                isLoading: false
            }

        default:
            return state
    }
}