import { OrNull, ServerError } from '@types';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { PatientStateEnum } from '../../../enums';
import { getPatientsWithReferrals } from './utils';
import { serverRequestActionCreator } from '../utils';
import { sortPatientsByLastReading } from '../../utils';

const GET_PATIENT_REQUESTED = `patients/GET_PATIENT_REQUESTED`;
const GET_PATIENT_SUCCESS = `patients/GET_PATIENT_SUCCESS`;
const GET_PATIENT_ERROR = `patients/GET_PATIENT_ERROR`;

const GET_PATIENTS_REQUESTED = `patient/GET_PATIENTS_REQUESTED`;
const GET_PATIENTS_SUCCESS = `patients/GET_PATIENTS_SUCCESS`;
const GET_PATIENTS_ERROR = `patient/GET_PATIENTS_ERROR`;
const CLEAR_GET_PATIENTS_ERROR = `patients/CLEAR_GET_PATIENTS_ERROR`;

const GET_REFERRALS_TABLE_PATIENTS_REQUESTED = `patient/GET_REFERRALS_TABLE_PATIENTS_REQUESTED`;
const GET_REFERRALS_TABLE_PATIENTS_SUCCESS = `patients/GET_REFERRALS_TABLE_PATIENTS_SUCCESS`;
const GET_REFERRALS_TABLE_PATIENTS_ERROR = `patient/GET_REFERRALS_TABLE_PATIENTS_ERROR`;
const CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR = `patients/CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR`;

const GET_GLOBAL_SEARCH_PATIENTS_SUCCESS = `patients/GET_GLOBAL_SEARCH_PATIENTS`;
const GET_GLOBAL_SEARCH_PATIENTS_ERROR = `patient/GET_GLOBAL_SEARCH_PATIENTS_ERROR`;

const TOGGLE_GLOBAL_SEARCH = `patients/TOGGLE_GLOBAL_SEARCH`;

const UPDATE_PATIENTS_TABLE_PAGE_NUMBER = `patients/UPDATE_PATIENTS_TABLE_PAGE_NUMBER`;
const UPDATE_REFERRALS_TABLE_PAGE_NUMBER = `patients/UPDATE_REFERRALS_TABLE_PAGE_NUMBER`;

const UPDATE_PATIENTS_TABLE_SEARCH_TEXT = `patients/UPDATE_PATIENTS_TABLE_SEARCH_TEXT`;
const UPDATE_REFERRALS_TABLE_SEARCH_TEXT = `patients/UPDATE_REFERRALS_TABLE_SEARCH_TEXT`;

const UPDATE_SELECTED_PATIENT_STATE = `patients/UPDATE_SELECTED_PATIENT_STATE`;

const TOGGLE_SHOW_REFERRED_PATIENTS = `patients/TOGGLE_SHOW_REFERRED_PATIENTS`;

const SORT_PATIENTS = `patients/SORT_PATIENTS`;
const SORT_REFERRALS_TABLE_PATIENTS = `patients/SORT_REFERRALS_TABLE_PATIENTS`;

const UPDATE_PATIENT_SUCCESS = `patient/UPDATE_PATIENT_SUCCESS`;
const UPDATE_PATIENT_ERROR = `patients/UPDATE_PATIENT_ERROR`;

const ADD_NEW_PATIENT = `patients/ADD_NEW_PATIENT`;
const AFTER_NEW_PATIENT_ADDED = `patients/AFTER_NEW_PATIENT_ADDED`;

const ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED`;
const ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS`;
const ADD_PATIENT_TO_HEALTH_FACILITY_ERROR = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_ERROR`;

export const clearGetPatientsError = () => ({
  type: CLEAR_GET_PATIENTS_ERROR,
});

export const clearGetReferralsTablePatientsError = () => ({
  type: CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR,
});

export const toggleGlobalSearch = (globalSearch: boolean) => ({
  type: TOGGLE_GLOBAL_SEARCH,
  payload: { globalSearch },
});

export const updatePatientsTablePageNumber = (pageNumber: number) => ({
  type: UPDATE_PATIENTS_TABLE_PAGE_NUMBER,
  payload: { pageNumber },
});

export const updateReferralsTablePageNumber = (pageNumber: number) => ({
  type: UPDATE_REFERRALS_TABLE_PAGE_NUMBER,
  payload: { pageNumber },
});

export const updatePatientsTableSearchText = (searchText?: string) => ({
  type: UPDATE_PATIENTS_TABLE_SEARCH_TEXT,
  payload: { searchText },
});

export const updateReferralsTableSearchText = (searchText?: string) => ({
  type: UPDATE_REFERRALS_TABLE_SEARCH_TEXT,
  payload: { searchText },
});

export const updateSelectedPatientState = (state?: PatientStateEnum) => ({
  type: UPDATE_SELECTED_PATIENT_STATE,
  payload: { state },
});

export const toggleShowReferredPatients = () => ({
  type: TOGGLE_SHOW_REFERRED_PATIENTS,
});

export const sortPatients = (sortedPatients: Array<any>) => ({
  type: SORT_PATIENTS,
  payload: { sortedPatients },
});

export const sortReferralsTablePatients = (sortedPatients: Array<any>) => ({
  type: SORT_REFERRALS_TABLE_PATIENTS,
  payload: { sortedPatients },
});

const getPatientRequested = () => ({
  type: GET_PATIENT_REQUESTED,
});

export const getPatient = (patientId: string) => {
  return (dispatch: Dispatch) => {
    dispatch(getPatientRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.PATIENT}${Endpoints.READING}/${patientId}`,
        onSuccess: (response: any) => ({
          type: GET_PATIENT_SUCCESS,
          payload: response,
        }),
        onError: (error: any) => ({
          type: GET_PATIENT_ERROR,
          payload: error,
        }),
      })
    );
  };
};

const getPatientsRequested = () => ({
  type: GET_PATIENTS_REQUESTED,
});

export const getPatients = (search?: string) => {
  return (dispatch: Dispatch) => {
    dispatch(getPatientsRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: search
          ? `${Endpoints.PATIENTS_GLOBAL_SEARCH}/${search}`
          : Endpoints.PATIENTS_ALL_INFO,
        onSuccess: (response: any) =>
          search
            ? {
                type: GET_GLOBAL_SEARCH_PATIENTS_SUCCESS,
                payload: response,
              }
            : {
                type: GET_PATIENTS_SUCCESS,
                payload: response,
              },
        onError: (error: ServerError) => {
          return search
            ? {
                type: GET_GLOBAL_SEARCH_PATIENTS_ERROR,
                payload: { ...error },
              }
            : {
                type: GET_PATIENTS_ERROR,
                payload: { ...error },
              };
        },
      })
    );
  };
};

const getReferralsTablePatientsRequested = () => ({
  type: GET_REFERRALS_TABLE_PATIENTS_REQUESTED,
});

export const getReferralsTablePatients = () => {
  return (dispatch: Dispatch) => {
    dispatch(getReferralsTablePatientsRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: Endpoints.PATIENTS_ALL_INFO,
        onSuccess: (response: any) => ({
          type: GET_REFERRALS_TABLE_PATIENTS_SUCCESS,
          payload: response,
        }),
        onError: (error: ServerError) => {
          return {
            type: GET_REFERRALS_TABLE_PATIENTS_ERROR,
            payload: { ...error },
          };
        },
      })
    );
  };
};

export const updatePatient = (patientId: any, data: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}/${patientId}`,
    method: Methods.PUT,
    data,
    onSuccess: (response: any) => ({
      type: UPDATE_PATIENT_SUCCESS,
      payload: response,
    }),
    onError: (error: any) => ({
      type: UPDATE_PATIENT_ERROR,
      payload: error,
    }),
  });
};

const addPatientToHealthFacilityRequested = (patientId: string) => ({
  type: ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED,
  payload: { patientId },
});

export const addPatientToHealthFacility = (patientId: string) => {
  return (dispatch: Dispatch) => {
    dispatch(addPatientToHealthFacilityRequested(patientId));

    return dispatch(
      serverRequestActionCreator({
        endpoint: Endpoints.PATIENT_FACILITY,
        method: Methods.POST,
        data: { patientId },
        onSuccess: () => ({
          type: ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS,
          payload: { patientId },
        }),
        onError: (error: any) => ({
          type: ADD_PATIENT_TO_HEALTH_FACILITY_ERROR,
          payload: error,
        }),
      })
    );
  };
};

export const addNewPatient = (newPatient: any) => ({
  type: ADD_NEW_PATIENT,
  payload: newPatient,
});

export const afterNewPatientAdded = () => ({
  type: AFTER_NEW_PATIENT_ADDED,
});

export type PatientsState = {
  error: OrNull<string>;
  preventFetch: boolean;
  patient: any;
  globalSearch: boolean;
  globalSearchPatientsList: OrNull<any>;
  patientsList: OrNull<any>;
  referralsTablePatientsList: OrNull<any>;
  isLoading: boolean;
  addingFromGlobalSearch: boolean;
  newPatientAdded: boolean;
  patientsTablePageNumber: number;
  referralsTablePageNumber: number;
  selectedPatientState?: PatientStateEnum;
  patientsTableSearchText?: string;
  referralsTableSearchText?: string;
  showReferredPatients?: boolean;
};

const initialState: PatientsState = {
  error: null,
  preventFetch: false,
  patient: {},
  globalSearch: false,
  globalSearchPatientsList: null,
  patientsList: null,
  referralsTablePatientsList: null,
  isLoading: false,
  addingFromGlobalSearch: false,
  newPatientAdded: false,
  patientsTablePageNumber: 0,
  referralsTablePageNumber: 0,
  selectedPatientState: undefined,
  patientsTableSearchText: undefined,
  referralsTableSearchText: undefined,
  showReferredPatients: undefined,
};

export const patientsReducer = (state = initialState, action: any) => {
  let patientToAdd = null;
  let updatedPatients = [];

  switch (action.type) {
    case GET_PATIENTS_SUCCESS:
      return {
        ...state,
        patientsList: action.payload.data.sort((a: any, b: any) =>
          sortPatientsByLastReading(a, b)
        ),
        isLoading: false,
      };
    case GET_REFERRALS_TABLE_PATIENTS_SUCCESS:
      return {
        ...state,
        referralsTablePatientsList: getPatientsWithReferrals(
          action.payload.data.sort((a: any, b: any) =>
            sortPatientsByLastReading(a, b)
          )
        ),
        isLoading: false,
      };
    case GET_GLOBAL_SEARCH_PATIENTS_SUCCESS:
      return {
        ...state,
        globalSearchPatientsList: action.payload.data.sort((a: any, b: any) =>
          sortPatientsByLastReading(a, b)
        ),
        isLoading: false,
      };
    case GET_PATIENTS_REQUESTED:
    case GET_REFERRALS_TABLE_PATIENTS_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };
    case GET_PATIENTS_ERROR:
    case GET_REFERRALS_TABLE_PATIENTS_ERROR:
      return {
        ...state,
        error: action.payload.message,
        isLoading: false,
        preventFetch: action.payload.status === 401,
      };
    case CLEAR_GET_PATIENTS_ERROR:
    case CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR:
      return {
        ...state,
        error: null,
      };
    case GET_GLOBAL_SEARCH_PATIENTS_ERROR:
      return {
        ...state,
        error: action.payload.message,
        isLoading: false,
      };
    case GET_PATIENT_SUCCESS:
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
          patient.patientId === action.payload.patientId
            ? { ...patient, state: PatientStateEnum.ADDING }
            : patient
        ),
        addingFromGlobalSearch: true,
      };
    case ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS:
      updatedPatients = (state.globalSearchPatientsList ?? []).map(
        (patient: any): any => {
          if (patient.patientId === action.payload.patientId) {
            patientToAdd = { ...patient, state: PatientStateEnum.JUST_ADDED };
            return patientToAdd;
          }
          return patient;
        }
      );
      if (patientToAdd === null && state.globalSearchPatientsList !== null) {
        throw new Error(`Unknown patient id: ${action.payload.patientId}`);
      }
      return {
        ...state,
        addingFromGlobalSearch: false,
        globalSearchPatientsList: updatedPatients,
        patientsList:
          patientToAdd && state.patientsList
            ? [patientToAdd, ...state.patientsList]
            : state.patientsList,
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
    case UPDATE_PATIENTS_TABLE_PAGE_NUMBER:
      return {
        ...state,
        patientsTablePageNumber: action.payload.pageNumber,
      };
    case UPDATE_REFERRALS_TABLE_PAGE_NUMBER:
      return {
        ...state,
        referralsTablePageNumber: action.payload.pageNumber,
      };
    case UPDATE_PATIENTS_TABLE_SEARCH_TEXT:
      return {
        ...state,
        patientsTableSearchText: action.payload.searchText,
      };
    case UPDATE_REFERRALS_TABLE_SEARCH_TEXT:
      return {
        ...state,
        referralsTableSearchText: action.payload.searchText,
      };
    case UPDATE_SELECTED_PATIENT_STATE:
      return {
        ...state,
        selectedPatientState: action.payload.state,
      };
    case TOGGLE_SHOW_REFERRED_PATIENTS:
      return {
        ...state,
        showReferredPatients: !state.showReferredPatients,
      };
    case SORT_PATIENTS:
      return state.globalSearch
        ? {
            ...state,
            globalSearchPatientsList: action.payload.sortedPatients,
          }
        : {
            ...state,
            patientsList: action.payload.sortedPatients,
          };
    case SORT_REFERRALS_TABLE_PATIENTS:
      return {
        ...state,
        referralsTablePatientsList: action.payload.sortedPatients,
      };
    default:
      return state;
  }
};
