import {GlobalSearchPatient, OrNull} from '@types';

import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { PatientStateEnum } from '../../../enums';
import { serverRequestActionCreator } from '../utils';
import { sortPatientsByLastReading } from '../../utils';

const GET_PATIENT = `patients/GET_PATIENT`;
const GET_PATIENT_REQUESTED = `patients/GET_PATIENT_REQUESTED`;
const GET_PATIENT_ERROR = `patients/GET_PATIENT_ERROR`;

const GET_PATIENTS = `patients/GET_PATIENTS`;
const GET_GLOBAL_SEARCH_PATIENTS = `patients/GET_GLOBAL_SEARCH_PATIENTS`;
const GET_PATIENTS_REQUESTED = `patient/GET_PATIENTS_REQUESTED`;
const GET_PATIENTS_ERROR = `patient/GET_PATIENTS_ERROR`;
const GET_GLOBAL_SEARCH_PATIENTS_ERROR = `patient/GET_GLOBAL_SEARCH_PATIENTS_ERROR`;

const UPDATE_PATIENT = `patient/UPDATE_PATIENT`;
const UPDATE_PATIENT_ERROR = `patients/UPDATE_PATIENT_ERROR`;

const ADD_NEW_PATIENT = `patients/ADD_NEW_PATIENT`;
const AFTER_NEW_PATIENT_ADDED = `patients/AFTER_NEW_PATIENT_ADDED`;

const ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED`;
const ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS`;
const ADD_PATIENT_TO_HEALTH_FACILITY_ERROR = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_ERROR`;

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
    }),
  });
};

export const getPatients = (search?: string) => {
  return serverRequestActionCreator({
    endpoint: search 
      ? `${Endpoints.PATIENTS_GLOBAL_SEARCH}/${search}` 
      : Endpoints.PATIENTS_ALL_INFO,
    onSuccess: (response: any) => search ? ({
      type: GET_GLOBAL_SEARCH_PATIENTS,
      payload: response,
    }) : ({
      type: GET_PATIENTS,
      payload: response,
    }),
    onError: (error: any) =>search ? ({
      type: GET_GLOBAL_SEARCH_PATIENTS_ERROR,
      payload: error,
    }) : ({
      type: GET_PATIENTS_ERROR,
      payload: error,
    }),
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
    }),
  });
};

export const addPatientToHealthFacilityRequested = (patient: GlobalSearchPatient) => ({
  type: ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED,
  payload: { patient },
});

export const addPatientToHealthFacility = (addedPatient: GlobalSearchPatient) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT_FACILITY}/${addedPatient.patientId}`,
    method: Methods.POST,
    data: addedPatient.patientId,
    onSuccess: () => ({
      type: ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS,
      payload: { addedPatient },
    }),
    onError: (error: any) => ({
      type: ADD_PATIENT_TO_HEALTH_FACILITY_ERROR,
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
  globalSearchPatientsList: OrNull<any>;
  patientsList: OrNull<any>;
  isLoading: boolean;
  addingFromGlobalSearch: boolean;
  newPatientAdded: boolean;
};

const initialState: PatientsState = {
  patient: {},
  globalSearchPatientsList: null,
  patientsList: null,
  isLoading: false,
  addingFromGlobalSearch: false,
  newPatientAdded: false,
};

export const patientsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case GET_PATIENTS:
      return {
        ...state,
        patientsList: action.payload.data
          .sort((a: any, b: any) => sortPatientsByLastReading(a, b)),
        isLoading: false,
      };
    case GET_GLOBAL_SEARCH_PATIENTS:
      return {
        ...state,
        globalSearchPatientsList: action.payload.data
          .sort((a: any, b: any) => sortPatientsByLastReading(a, b)),
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
    case GET_GLOBAL_SEARCH_PATIENTS_ERROR:
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
    case ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED:
      return {
        ...state,
        globalSearchPatientsList: (state.globalSearchPatientsList ?? []).map(
            (patient: any): any => patient.patientId === action.payload.patient.patientId 
              ? { ...action.payload.patient, state: PatientStateEnum.ADDING } 
              : patient
          ),
        addingFromGlobalSearch: true,
      };
    case ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS:
      return {
        ...state,
        addingFromGlobalSearch: false,
        globalSearchPatientsList: (state.globalSearchPatientsList ?? []).map(
          (patient: any): any => patient.patientId === action.payload.addedPatient.patientId 
            ? { ...patient, state: PatientStateEnum.JUST_ADDED } 
            : patient
        ),
        patientsList: [action.payload.addedPatient, ...(state.patientsList ?? [])],
      }
    case ADD_PATIENT_TO_HEALTH_FACILITY_ERROR:
      return {
        ...state,
        addingFromGlobalSearch: false,
      };
    default:
      return state;
  }
};
