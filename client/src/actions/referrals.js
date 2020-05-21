import axios from 'axios'

import BASE_URL from '../serverUrl'
import { requestActionCreator } from './api'
import { Method, Endpoint } from '../api/constants'

export const GET_REFERRALS = 'referrals/GET_REFERRALS'
export const GET_REFERRALS_REQUESTED = 'referral/GET_REFERRALS_REQUESTED'
export const GET_REFERRALS_ERR = 'referral/GET_REFERRALS_ERR'

export const GET_REFERRAL = 'referrals/GET_REFERRAL'
export const GET_REFERRAL_REQUESTED = 'referral/GET_REFERRAL_REQUESTED'
export const GET_REFERRAL_ERR = 'referral/GET_REFERRAL_ERR'

export const UPDATE_REFERRAL = 'referral/UPDATE_REFERRAL'
export const UPDATE_REFERRAL_REQUESTED = 'referrals/UPDATE_REFERRALS_REQUESTED'
export const UPDATE_REFERRAL_ERR = 'referrals/UPDATE_REFERRAL_ERR'

export const UPDATE_FOLLOW_UP = 'referral/UPDATE_FOLLOW_UP'
export const UPDATE_FOLLOW_UP_REQUESTED = 'referrals/UPDATE_FOLLOW_UP_REQUESTED'
export const UPDATE_FOLLOW_UP_ERR = 'referrals/UPDATE_FOLLOW_UP_ERR'

export const SET_READING_ID = 'referrals/SET_READING_ID'

export const getReferral = referralId => {
  return requestActionCreator(
    Endpoint.REFERRAL + '/' + referralId,
    Method.GET,
    null,
    getReferralOnSuccess,
    getReferralOnError
  )
}
const getReferralOnSuccess = response => ({
  type: GET_REFERRAL,
  payload: response
})

const getReferralOnError = error => ({
  type: GET_REFERRAL_ERR,
  payload: error
})

// TODO: create endpoint /referral to get all referrals for user
export const getReferrals = referralIds => {
  return dispatch => {
    dispatch({
      type: GET_REFERRALS_REQUESTED
    })

    let referralPromises = []
    for (let i in referralIds) {
      let referralId = referralIds[i]
      referralPromises.push(axios.get(BASE_URL + `/referral/${referralId}`))
    }

    Promise.all(referralPromises)
      .then(results => {
        console.log('referralPromise results: ', results)
        let referrals = {}
        for (let i in results) {
          let thisReferral = results[i].data
          referrals[thisReferral.readingId] = thisReferral
        }

        console.log('referrals: ', referrals)

        dispatch({
          type: GET_REFERRALS,
          payload: referrals
        })
      })
      .catch(err => {
        console.log(err)
        dispatch({
          type: GET_REFERRALS_ERR
        })
      })
  }
}

export const updateFollowUp = (followUpId, data) => {
  return requestActionCreator(
    Endpoint.FOLLOW_UP + '/' + followUpId,
    Method.PUT,
    data,
    updateFollowUpOnSuccess,
    updateFollowUpOnError
  )
}

export const createFollowUp = data => {
  return requestActionCreator(
    Endpoint.FOLLOW_UP,
    Method.POST,
    data,
    updateFollowUpOnSuccess,
    updateFollowUpOnError
  )
}

const updateFollowUpOnSuccess = response => ({
  type: UPDATE_FOLLOW_UP,
  payload: response
})

const updateFollowUpOnError = error => ({
  type: UPDATE_FOLLOW_UP_ERR,
  payload: error
})

export const setReadingId = readingId => {
  return dispatch => {
    console.log('setting reading id')
    return dispatch({
      type: SET_READING_ID,
      payload: readingId
    })
  }
}
