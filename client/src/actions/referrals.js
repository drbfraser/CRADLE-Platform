import axios from 'axios';

import BASE_URL from '../serverUrl'

export const GET_REFERRALS = 'patients/GET_REFERRALS'
export const GET_REFERRALS_REQUESTED = 'patient/GET_REFERRALS_REQUESTED'
export const GET_REFERRALS_ERR = 'patient/GET_REFERRALS_ERR'

export const GET_REFERRAL = 'patients/GET_REFERRAL'
export const GET_REFERRAL_REQUESTED = 'patient/GET_REFERRAL_REQUESTED'
export const GET_REFERRAL_ERR = 'patient/GET_REFERRAL_ERR'

export const UPDATE_REFERRAL = 'patient/UPDATE_REFERRAL'
export const UPDATE_REFERRAL_REQUESTED  = 'patients/UPDATE_REFERRALS_REQUESTED'
export const UPDATE_REFERRAL_ERR = 'patients/UPDATE_REFERRAL_ERR'

export const UPDATE_FOLLOW_UP = 'patient/UPDATE_FOLLOW_UP'
export const UPDATE_FOLLOW_UP_REQUESTED  = 'patients/UPDATE_FOLLOW_UPS_REQUESTED'
export const UPDATE_FOLLOW_UP_ERR = 'patients/UPDATE_FOLLOW_UP_ERR'

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

// export const updateFollowUp = (followUpId, data) => {
//     return dispatch => {
//         dispatch({
//             type: UPDATE_FOLLOW_UP_REQUESTED
//         })

//         return axios.put(BASE_URL + `/follow_up/${followUpId}`, data).then((res) => {
//             dispatch({
//                 type: UPDATE_FOLLOW_UP,
//                 payload: res.data
//             })
//             console.log("UPDATE FOLLOW UP DATA", res.data)
//         })
//         .then(() => dispatch(getReferrals(res.data.referral)))
//         .catch(err => {
//             console.log(err);
//             dispatch({
//                 type: UPDATE_FOLLOW_ERR
//             })
//         })
//     }
// }