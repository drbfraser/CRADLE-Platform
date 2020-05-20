import { Endpoint, Method } from '../api/constants';

import { requestActionCreator } from './api';

export const GET_PATIENT = 'patients/GET_PATIENT'
export const GET_PATIENT_REQUESTED = 'patients/GET_PATIENT_REQUESTED'
export const GET_PATIENT_ERR = 'patients/GET_PATIENT_ERR'

export const GET_PATIENTS = 'patients/GET_PATIENTS'
export const GET_PATIENTS_REQUESTED = 'patient/GET_PATIENTS_REQUESTED'
export const GET_PATIENTS_ERR = 'patient/GET_PATIENTS_ERR'

export const UPDATE_PATIENT = 'patient/UPDATE_PATIENT'
export const UPDATE_PATIENT_REQUESTED  = 'patients/UPDATE_PATIENTS_REQUESTED'
export const UPDATE_PATIENT_ERR = 'patients/UPDATE_PATIENT_ERR'

export const ADD_NEW_PATIENT = 'patients/ADD_NEW_PATIENT'
export const AFTER_NEW_PATIENT_ADDED = 'patients/AFTER_NEW_PATIENT_ADDED'

export const getPatient = (patientId) => {
    return requestActionCreator(
        Endpoint.PATIENT + Endpoint.READING + '/' + patientId,
        Method.GET,
        null,
        getPatientOnSuccess,
        getPatientOnError
    )
}

export const getPatients = () => {
    return requestActionCreator(
        Endpoint.PATIENTS_ALL_INFO,
        Method.GET,
        null,
        getPatientsOnSuccess,
        getPatientsOnError
    )
}

export const updatePatient = (patientId, data) => {
    return requestActionCreator(
        Endpoint.PATIENT + '/' + patientId,
        Method.PUT,
        data,
        updatePatientOnSuccess,
        updatePatientOnError
    )
}

const updatePatientOnSuccess = response => ({
    type: UPDATE_PATIENT,
    payload: response
})

const updatePatientOnError = error => ({
    type: UPDATE_PATIENT_ERR,
    payload: error
})

export const getPatientsRequested = () => ({
    type: GET_PATIENTS_REQUESTED
})

const getPatientsOnSuccess = response => ({
    type: GET_PATIENTS,
    payload: response
})

const getPatientsOnError = error => ({
    type: GET_PATIENTS_ERR,
    payload: error
})

const getPatientOnSuccess = response => ({
    type: GET_PATIENT,
    payload: response
})

const getPatientOnError = error => ({
    type: GET_PATIENT_ERR,
    payload: error
})

export const addNewPatient = newPatient => ({
    type: ADD_NEW_PATIENT,
    payload: newPatient,
})

export const afterNewPatientAdded = () => ({
    type: AFTER_NEW_PATIENT_ADDED,
})

export const getPatientRequested = () => ({
    type: GET_PATIENT_REQUESTED
})