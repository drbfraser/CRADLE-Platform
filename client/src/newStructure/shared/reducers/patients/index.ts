import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { OrNull } from '@types';
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
const UPDATE_PATIENTS_TABLE_SEARCH_TEXT = `patients/UPDATE_PATIENTS_TABLE_SEARCH_TEXT`;
const UPDATE_SELECTED_PATIENT_STATE = `patients/UPDATE_SELECTED_PATIENT_STATE`;
const TOGGLE_SHOW_REFERRED_PATIENTS = `patients/TOGGLE_SHOW_REFERRED_PATIENTS`;
const SORT_PATIENTS = `patients/SORT_PATIENTS`;
const GET_PATIENTS_REQUESTED = `patient/GET_PATIENTS_REQUESTED`;
const GET_PATIENTS_ERROR = `patient/GET_PATIENTS_ERROR`;
const GET_GLOBAL_SEARCH_PATIENTS_ERROR = `patient/GET_GLOBAL_SEARCH_PATIENTS_ERROR`;

const DOES_PATIENT_EXIST = `patient/DOES_PATIENT_EXIST`;
const DOES_PATIENT_EXIST_ERROR = `patient/DOES_PATIENT_EXIST_ERROR`;
const AFTER_DOES_PATIENT_EXIST = `patient/AFTER_DOES_PATIENT_EXIST`;

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

export const updatePatientsTableSearchText = (searchText?: string) => ({
  type: UPDATE_PATIENTS_TABLE_SEARCH_TEXT,
  payload: { searchText },
});

export const updateSelectedPatientState = (state?: PatientStateEnum) => ({
  type: UPDATE_SELECTED_PATIENT_STATE,
  payload: { state },
});

export const toggleShowReferredPatients = () => ({
  type: TOGGLE_SHOW_REFERRED_PATIENTS,
});

export const afterDoesPatientExist = () => ({
  type: AFTER_DOES_PATIENT_EXIST,
});

export const sortPatients = (sortedPatients: Array<any>) => ({
  type: SORT_PATIENTS,
  payload: { sortedPatients },
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

export const addPatientNew = (patient: any) => {
  return serverRequestActionCreator({
    endpoint: `/patients`,
    method: Methods.POST,
    data: patient,
    onSuccess: (response: any) => ({
      type: ADD_NEW_PATIENT,
      payload: response,
    }),
    onError: (error: any) => ({
      type: GET_PATIENT_ERROR,
      payload: error,
    }),
  });
};

export const doesPatientExist = (patientId: any) => {
  return serverRequestActionCreator({
    endpoint: `/patients/${patientId}`,
    onSuccess: (response: any) => ({
      type: DOES_PATIENT_EXIST,
      payload: response,
    }),
    onError: (error: any) => ({
      type: DOES_PATIENT_EXIST_ERROR,
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

export const addPatientToHealthFacilityRequested = (patientId: string) => ({
  type: ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED,
  payload: { patientId },
});

export const addPatientToHealthFacility = (patientId: string) => {
  return serverRequestActionCreator({
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
  selectedPatientState?: PatientStateEnum;
  patientsTableSearchText?: string;
  showReferredPatients?: boolean;
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
  selectedPatientState: undefined,
  patientsTableSearchText: undefined,
  showReferredPatients: undefined,
};

export const patientsReducer = (state = initialState, action: any) => {
  let patientToAdd = null;
  let updatedPatients = [];

  switch (action.type) {
    case DOES_PATIENT_EXIST:
      return {
        ...state,
        patient: action.payload.data,
        patientExist: true,
      };
    case DOES_PATIENT_EXIST_ERROR: {
      return {
        ...state,
        patientExist: false,
      };
    }
    case AFTER_DOES_PATIENT_EXIST:
      return {
        ...state,
        patient: null,
        patientExist: false,
      };
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
    case UPDATE_GLOBAL_SEARCH_PAGE_NUMBER:
      return {
        ...state,
        globalSearchPageNumber: action.payload.pageNumber,
      };
    case UPDATE_PATIENTS_TABLE_SEARCH_TEXT:
      return {
        ...state,
        patientsTableSearchText: action.payload.searchText,
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
    default:
      return state;
  }
};
