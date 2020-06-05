import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { serverRequestActionCreator } from '../utils';
import { sortPatientsByLastReading } from '../../utils';
import {OrNull} from '@types';

const GET_PATIENT = `patients/GET_PATIENT`;
const GET_PATIENT_REQUESTED = `patients/GET_PATIENT_REQUESTED`;
const GET_PATIENT_ERROR = `patients/GET_PATIENT_ERROR`;

const GET_PATIENTS = `patients/GET_PATIENTS`;
const GET_PATIENTS_REQUESTED = `patient/GET_PATIENTS_REQUESTED`;
const GET_PATIENTS_ERROR = `patient/GET_PATIENTS_ERROR`;

const UPDATE_PATIENT = `patient/UPDATE_PATIENT`;
const UPDATE_PATIENT_ERROR = `patients/UPDATE_PATIENT_ERROR`;

const ADD_NEW_PATIENT = `patients/ADD_NEW_PATIENT`;
const AFTER_NEW_PATIENT_ADDED = `patients/AFTER_NEW_PATIENT_ADDED`;

export const getPatient = (patientId: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}${Endpoints.READING}/${patientId}`,
    onSuccess: (response: any) => ({
      type: GET_PATIENT,
      payload: response,
    }),
    onError: (error: any) => ({
      type: GET_PATIENT_ERROR,
      payload: error,
    })
  });
};

export const getPatients = () => {
  return serverRequestActionCreator({
    endpoint: Endpoints.PATIENTS_ALL_INFO,
    onSuccess: (response: any) => ({
      type: GET_PATIENTS,
      payload: response,
    }),
    onError: (error: any) => ({
      type: GET_PATIENTS_ERROR,
      payload: error,
    })
  });
};

export const updatePatient = (patientId: any, data: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}/${patientId}`,
    method: Methods.PUT,
    data,
    onSuccess: (response: any) => ({
      type: UPDATE_PATIENT,
      payload: response,
    }),
    onError: (error: any) => ({
      type: UPDATE_PATIENT_ERROR,
      payload: error,
    })
  });
};

export const getPatientsRequested = () => ({
  type: GET_PATIENTS_REQUESTED,
});

export const addNewPatient = (newPatient: any) => ({
  type: ADD_NEW_PATIENT,
  payload: newPatient,
});

export const afterNewPatientAdded = () => ({
  type: AFTER_NEW_PATIENT_ADDED,
});

export const getPatientRequested = () => ({
  type: GET_PATIENT_REQUESTED,
});

export type PatientsState = {
  patient: any;
  patientsList: OrNull<any>;
  isLoading: boolean;
  newPatientAdded: boolean;
};

const initialState: PatientsState = {
  patient: {},
  patientsList: null,
  isLoading: false,
  newPatientAdded: false,
};

export const patientsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case GET_PATIENTS:
      const patientsList = action.payload.data;
      patientsList.sort((a: any, b: any) => sortPatientsByLastReading(a, b));
      return {
        ...state,
        patientsList,
        isLoading: false,
      };
    case GET_PATIENTS_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };
    case GET_PATIENTS_ERROR:
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
        patientsList: [newPatient, ...(state.patientsList ?? [])],
        newPatientAdded: true,
      };
    case AFTER_NEW_PATIENT_ADDED:
      return {
        ...state,
        newPatientAdded: false,
      };
    case GET_PATIENT_ERROR:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};
