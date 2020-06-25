import { GlobalSearchPatient, OrNull } from '@types';

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
const TOGGLE_GLOBAL_SEARCH = `patients/TOGGLE_GLOBAL_SEARCH`;
const UPDATE_GLOBAL_SEARCH_PAGE_NUMBER = `patients/UPDATE_GLOBAL_SEARCH_PAGE_NUMBER`;
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

export const toggleGlobalSearch = (globalSearch: boolean) => ({
  type: TOGGLE_GLOBAL_SEARCH,
  payload: { globalSearch },
});

export const updateGlobalSearchPageNumber = (pageNumber: number) => ({
  type: UPDATE_GLOBAL_SEARCH_PAGE_NUMBER,
  payload: { pageNumber },
});

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
    onSuccess: (response: any) =>
      search
        ? {
            type: GET_GLOBAL_SEARCH_PATIENTS,
            payload: response,
          }
        : {
            type: GET_PATIENTS,
            payload: response,
          },
    onError: (error: any) =>
      search
        ? {
            type: GET_GLOBAL_SEARCH_PATIENTS_ERROR,
            payload: error,
          }
        : {
            type: GET_PATIENTS_ERROR,
            payload: error,
          },
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

export const addPatientToHealthFacilityRequested = (
  patient: GlobalSearchPatient
) => ({
  type: ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED,
  payload: { patient },
});

export const addPatientToHealthFacility = (
  addedPatient: GlobalSearchPatient
) => {
  const { patientId } = addedPatient;

  return serverRequestActionCreator({
    endpoint: Endpoints.PATIENT_FACILITY,
    method: Methods.POST,
    data: { patientId },
    onSuccess: () => ({
      type: ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS,
      payload: { addedPatient },
    }),
    onError: (error: any) => ({
      type: ADD_PATIENT_TO_HEALTH_FACILITY_ERROR,
      payload: error,
    }),
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
  globalSearch: boolean;
  globalSearchPageNumber: number;
  globalSearchPatientsList: OrNull<any>;
  patientsList: OrNull<any>;
  isLoading: boolean;
  addingFromGlobalSearch: boolean;
  newPatientAdded: boolean;
};

const initialState: PatientsState = {
  patient: {},
  globalSearch: false,
  globalSearchPageNumber: 0,
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
        patientsList: action.payload.data.sort((a: any, b: any) =>
          sortPatientsByLastReading(a, b)
        ),
        isLoading: false,
      };
    case GET_GLOBAL_SEARCH_PATIENTS:
      return {
        ...state,
        globalSearchPatientsList: action.payload.data.sort((a: any, b: any) =>
          sortPatientsByLastReading(a, b)
        ),
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
      return {
        ...state,
        patientsList: [action.payload, ...(state.patientsList ?? [])],
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
        globalSearchPatientsList: (
          state.globalSearchPatientsList ?? []
        ).map((patient: any): any =>
          patient.patientId === action.payload.patient.patientId
            ? { ...action.payload.patient, state: PatientStateEnum.ADDING }
            : patient
        ),
        addingFromGlobalSearch: true,
      };
    case ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS:
      return {
        ...state,
        addingFromGlobalSearch: false,
        globalSearchPatientsList: (
          state.globalSearchPatientsList ?? []
        ).map((patient: any): any =>
          patient.patientId === action.payload.addedPatient.patientId
            ? { ...patient, state: PatientStateEnum.JUST_ADDED }
            : patient
        ),
        patientsList: [
          action.payload.addedPatient,
          ...(state.patientsList ?? []),
        ],
      };
    case ADD_PATIENT_TO_HEALTH_FACILITY_ERROR:
      return {
        ...state,
        addingFromGlobalSearch: false,
      };
    case TOGGLE_GLOBAL_SEARCH:
      return {
        ...state,
        globalSearch: action.payload.globalSearch,
      };
    case UPDATE_GLOBAL_SEARCH_PAGE_NUMBER:
      return {
        ...state,
        globalSearchPageNumber: action.payload.pageNumber,
      };
    default:
      return state;
  }
};
