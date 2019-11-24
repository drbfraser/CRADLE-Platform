import axios from 'axios';

import BASE_URL from '../serverUrl'
import { getPatients } from './patients';

export const GET_REFERRALS = 'referrals/GET_REFERRALS'
export const GET_REFERRALS_REQUESTED = 'referral/GET_REFERRALS_REQUESTED'
export const GET_REFERRALS_ERR = 'referral/GET_REFERRALS_ERR'

export const GET_REFERRAL = 'referrals/GET_REFERRAL'
export const GET_REFERRAL_REQUESTED = 'referral/GET_REFERRAL_REQUESTED'
export const GET_REFERRAL_ERR = 'referral/GET_REFERRAL_ERR'

export const UPDATE_REFERRAL = 'referral/UPDATE_REFERRAL'
export const UPDATE_REFERRAL_REQUESTED  = 'referrals/UPDATE_REFERRALS_REQUESTED'
export const UPDATE_REFERRAL_ERR = 'referrals/UPDATE_REFERRAL_ERR'

export const UPDATE_FOLLOW_UP = 'referral/UPDATE_FOLLOW_UP'
export const UPDATE_FOLLOW_UP_REQUESTED  = 'referrals/UPDATE_FOLLOW_UP_REQUESTED'
export const UPDATE_FOLLOW_UP_ERR = 'referrals/UPDATE_FOLLOW_UP_ERR'

export const SET_READING_ID = 'referrals/SET_READING_ID'

export const getReferral = (referralId) => {
    return dispatch => {
      dispatch({
        type: GET_REFERRAL_REQUESTED
      })

      axios.get(BASE_URL + `/referral/${referralId}`).then((res) => {
          console.log("get referral res: ", res);
          dispatch({
              type: GET_REFERRAL,
              payload: res.data
          })
      }).catch(err => {
          console.log(err);
          dispatch({
              type: GET_REFERRAL_ERR
          })
      })
    }
  }

export const getReferrals = (referralIds) => {
    return dispatch => {
      dispatch({
        type: GET_REFERRALS_REQUESTED
      })

      let referralPromises = []
      for(let i in referralIds) {
        let referralId = referralIds[i];  
        referralPromises.push(
            axios.get(BASE_URL + `/referral/${referralId}`)
          )
      }

      Promise.all(referralPromises).then(results => {
          console.log("referralPromise results: ", results)
          let referrals = {}
          for(let i in results) {
                let thisReferral = results[i].data;
                referrals[thisReferral.readingId] = thisReferral;
          }

          console.log("referrals: ", referrals)

            dispatch({
              type: GET_REFERRALS,
              payload: referrals
          })
      }).catch(err => {
          console.log(err);
          dispatch({
              type: GET_REFERRALS_ERR
          })
      })
    }
  }

export const updateFollowUp = (followUpId, data) => {
    return dispatch => {
        dispatch({
            type: UPDATE_FOLLOW_UP_REQUESTED
        })
        const token = localStorage.token;
        return axios.put(BASE_URL + `/follow_up/${followUpId}`, data, {
            'headers': {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }).then((res) => {
            dispatch({
                type: UPDATE_FOLLOW_UP,
                payload: res.data
            })
            console.log("UPDATE FOLLOW UP DATA", res.data)
        })
        // .then(() => dispatch(getReferrals(res.data.referral)))
        .catch(err => {
            console.log(err);
            dispatch({
                type: UPDATE_FOLLOW_UP_ERR
            })
        })
    }
}

export const createFollowUp = (data) => {
    return dispatch => {
        dispatch({
            type: UPDATE_FOLLOW_UP_REQUESTED
        })
        const token = localStorage.token;
        return axios.post(BASE_URL + `/follow_up`, data, {
            'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            dispatch({
                type: UPDATE_FOLLOW_UP,
                payload: res.data
            })
            console.log("CREATE FOLLOW UP DATA", res.data)
        }).then(() => dispatch(getPatients()))
        // .then(() => dispatch(getReferrals(res.data.referral)))
        .catch(err => {
            console.log(err);
            dispatch({
                type: UPDATE_FOLLOW_UP_ERR
            })
        })
    }
}

export const setReadingId = (readingId) => {
    return dispatch => {
        console.log("setting reading id")
        return dispatch({
            type: SET_READING_ID,
            payload: readingId
        })
    }
}