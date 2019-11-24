import axios from 'axios';

import BASE_URL from '../serverUrl'

export const GET_PATIENTS = 'patients/GET_PATIENTS'
export const GET_PATIENTS_REQUESTED = 'patient/GET_PATIENTS_REQUESTED'
export const GET_PATIENTS_ERR = 'patient/GET_PATIENTS_ERR'

export const UPDATE_PATIENT = 'patient/UPDATE_PATIENT'
export const UPDATE_PATIENT_REQUESTED  = 'patients/UPDATE_PATIENTS_REQUESTED'
export const UPDATE_PATIENT_ERR = 'patients/UPDATE_PATIENT_ERR'

export const getPatients = () => {
    const token = localStorage.token;
    return dispatch => {
      dispatch({
        type: GET_PATIENTS_REQUESTED
      })
      axios.get(BASE_URL + "/patient/allinfo",{
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).then((res) => {
          console.log("get patients res: ", res);
          dispatch({
              type: GET_PATIENTS,
              payload: res.data
          })
      }).catch(err => {
          console.log(err);
          dispatch({
              type: GET_PATIENTS_ERR
          })
      })
    }
  }

export const updatePatient = (patientId, data) => {
    return dispatch => {
        dispatch({
            type: UPDATE_PATIENT_REQUESTED
        })

        return axios.put(BASE_URL + "/patient/"+ patientId, data).then((res) => {
            dispatch({
                type: UPDATE_PATIENT,
                payload: res.data
            })
            console.log("UPDATE PATIENT DATA", res.data)
        })
        .then( () => dispatch(getPatients()))
        .catch(err => {
            console.log(err);
            dispatch({
                type: UPDATE_PATIENT_ERR
            })
        })
    }
}