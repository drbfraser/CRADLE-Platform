// import all the actions here

import {
    ADD_NEW_PATIENT_DONE,
    ADD_NEW_PATIENT_REQUESTED,
    GET_PATIENT,
    GET_PATIENTS,
    GET_PATIENTS_ERR,
    GET_PATIENTS_REQUESTED,
    GET_PATIENT_ERR,
    GET_PATIENT_REQUESTED,
} from '../actions/patients'

import { sortPatientsByLastReading } from '../containers/patientPage/patientUtils'

const initialState = {
    patient: {},
    patientsList: [],
    isLoading: true,
    addedNewPatient: false,
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_PATIENTS:
            const patientsList = action.payload.data
            patientsList.sort((a, b) => sortPatientsByLastReading(a, b))
            return {
                ...state,
                patientsList: patientsList,
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
        case GET_PATIENT:
            return {
                ...state,
                patient: action.payload.data,
                isLoading: false
            }

        case GET_PATIENT_REQUESTED:
            return {
                ...state,
                isLoading: true
            }

        case ADD_NEW_PATIENT_REQUESTED:
            return {
                ...state,
                addedNewPatient: false
            }

        case ADD_NEW_PATIENT_DONE:
          const newPatient = action.payload;
            return {
                ...state,
                patientsList: [newPatient, ...patientsList],
                addedNewPatient: true
            }

        case GET_PATIENT_ERR:
            return {
                ...state,
                isLoading: false
            }

        default:
            return state
    }
}
