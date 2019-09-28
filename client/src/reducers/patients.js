// import all the actions here

import { 
    GET_PATIENTS,
    GET_PATIENTS_REQUESTED,
    GET_PATIENTS_ERR
 } from '../actions/patients';

const initialState = {
    patientsList: [],
    isFetchingPatient: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_PATIENTS:
      return {
        ...state,
        patientsList: action.payload,
        isLoading: false
      }
    
    case GET_PATIENTS_REQUESTED: 
      return {
          ...state,
          isLoading: true
      }

    case GET_PATIENTS_ERR:
      return {
          ...state,
          isLoading: false
      }

    default:
      return state
  }
}
