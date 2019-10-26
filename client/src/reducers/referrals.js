// import all the actions here

import { 
    GET_REFERRAL,
    GET_REFERRAL_REQUESTED,
    GET_REFERRAL_ERR,
    UPDATE_FOLLOW_UP,
    UPDATE_FOLLOW_UP_REQUESTED,
    UPDATE_FOLLOW_UP_ERR
 } from '../actions/referrals';

const initialState = {
    referral: null,
    isFetchingReferral: false,
    msg: ""
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_REFERRAL:
      return {
        ...state,
        referral: action.payload,
        isLoading: false
      }
    
    case UPDATE_FOLLOW_UP:
        return {
            ...state,
            referral: {
                ...state.referral,
                followUp: action.payload
            },
            isLoading: false
        }

    case GET_REFERRAL_REQUESTED: 
    case UPDATE_FOLLOW_UP_REQUESTED:  
        return {
          ...state,
          isLoading: true
      }     

    case GET_REFERRAL_ERR:
    case UPDATE_FOLLOW_UP_ERR:
      return {
          ...state,
          isLoading: false
      }

    default:
      return state
  }
}
