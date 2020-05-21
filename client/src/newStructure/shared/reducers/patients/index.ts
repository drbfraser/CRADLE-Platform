import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { serverRequestActionCreator } from '../utils';
import { sortPatientsByLastReading } from '../../utils';

const GET_PATIENT = `patients/GET_PATIENT`;
const GET_PATIENT_REQUESTED = `patients/GET_PATIENT_REQUESTED`;
const GET_PATIENT_ERR = `patients/GET_PATIENT_ERR`;

const GET_PATIENTS = `patients/GET_PATIENTS`;
const GET_PATIENTS_REQUESTED = `patient/GET_PATIENTS_REQUESTED`;
const GET_PATIENTS_ERR = `patient/GET_PATIENTS_ERR`;

const UPDATE_PATIENT = `patient/UPDATE_PATIENT`;
const UPDATE_PATIENT_ERR = `patients/UPDATE_PATIENT_ERR`;

const ADD_NEW_PATIENT = `patients/ADD_NEW_PATIENT`;
const AFTER_NEW_PATIENT_ADDED = `patients/AFTER_NEW_PATIENT_ADDED`;

export const getPatient = (patientId) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}${Endpoints.READING}/${patientId}`,
    onSuccess: (response) => ({
      type: GET_PATIENT,
      payload: response,
    }),
    onError: (error) => ({
      type: GET_PATIENT_ERR,
      payload: error,
    })
  });
};

export const getPatients = () => {
  return serverRequestActionCreator({
    endpoint: Endpoints.PATIENTS_ALL_INFO,
    onSuccess: (response) => ({
      type: GET_PATIENTS,
      payload: response,
    }),
    onError: (error) => ({
      type: GET_PATIENTS_ERR,
      payload: error,
    })
  });
};

export const updatePatient = (patientId, data) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}/${patientId}`,
    method: Methods.PUT,
    data,
    onSuccess: (response) => ({
      type: UPDATE_PATIENT,
      payload: response,
    }),
    onError: (error) => ({
      type: UPDATE_PATIENT_ERR,
      payload: error,
    })
  });
};

export const getPatientsRequested = () => ({
  type: GET_PATIENTS_REQUESTED,
});

export const addNewPatient = (newPatient) => ({
  type: ADD_NEW_PATIENT,
  payload: newPatient,
});

export const afterNewPatientAdded = () => ({
  type: AFTER_NEW_PATIENT_ADDED,
});

export const getPatientRequested = () => ({
  type: GET_PATIENT_REQUESTED,
});

const initialState = {
  patient: {},
  patientsList: [],
  isLoading: true,
  newPatientAdded: false,
};

export const patientsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PATIENTS:
      const patientsList = action.payload.data;
      patientsList.sort((a, b) => sortPatientsByLastReading(a, b));
      return {
        ...state,
        patientsList: patientsList,
        isLoading: false,
      };

    case GET_PATIENTS_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };

    case GET_PATIENTS_ERR:
      return {
        ...state,
        isLoading: false,
      };
    case GET_PATIENT:
      return {
        ...state,
        patient: action.payload.data,
        isLoading: false,
      };

    case GET_PATIENT_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };

    case ADD_NEW_PATIENT:
      const newPatient = action.payload;
      return {
        ...state,
        patientsList: [newPatient, ...state.patientsList],
        newPatientAdded: true,
      };

    case AFTER_NEW_PATIENT_ADDED:
      return {
        ...state,
        newPatientAdded: false,
      };

    case GET_PATIENT_ERR:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};
