// import all the actions here

import { 
    GET_REFERRAL, // currently unused
    GET_REFERRAL_REQUESTED, // currently unused
    GET_REFERRAL_ERR, // currently unused
    GET_REFERRALS,
    GET_REFERRALS_REQUESTED,
    GET_REFERRALS_ERR,
    UPDATE_FOLLOW_UP,
    UPDATE_FOLLOW_UP_REQUESTED,
    UPDATE_FOLLOW_UP_ERR,
    SET_READING_ID
 } from '../actions/referrals';

const initialState = {
    mappedReferrals: {}, // maps reading id to referral objects
    referralId: null, 
    readingId: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    
    case GET_REFERRAL:
      return {
        ...state,
        referral: action.payload,
        isLoading: false
      }

    case GET_REFERRALS:
        return {
            ...state,
            mappedReferrals: action.payload,
            isLoading: false
        }
    
    case UPDATE_FOLLOW_UP:    
        return {
            ...state,
            mappedReferrals: {
                ...state.mappedReferrals,
                [state.readingId]: {
                    ...state.mappedReferrals[state.readingId],
                    followUp: action.payload
                }
            },
            isLoading: false
        }

    case GET_REFERRAL_REQUESTED: 
    case GET_REFERRALS_REQUESTED: 
    case UPDATE_FOLLOW_UP_REQUESTED:  
        return {
          ...state,
          isLoading: true
      }     

    case GET_REFERRAL_ERR:
    case GET_REFERRALS_ERR: 
    case UPDATE_FOLLOW_UP_ERR:
      return {
          ...state,
          isLoading: false
      }
    
    case SET_READING_ID:
        return {
            ...state,
            readingId: action.payload
        }

    default:
      return state
  }
}
