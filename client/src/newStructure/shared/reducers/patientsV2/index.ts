import { Callback, GlobalSearchPatient, OrNull, Patient } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';

enum PatientsActionEnum {
  CLEAR_REQUEST_OUTCOME = `patients/CLEAR_REQUEST_OUTCOME`,
  GET_PATIENTS_ERROR = `patients/GET_PATIENTS_ERROR`,
  GET_PATIENTS_SUCCESS = `patients/GET_PATIENTS_SUCCESS`,
  GET_GLOBAL_SEARCH_PATIENTS_ERROR = `patients/GET_GLOBAL_SEARCH_PATIENTS_ERROR`,
  GET_GLOBAL_SEARCH_PATIENTS_SUCCESS = `patients/GET_GLOBAL_SEARCH_PATIENTS_SUCCESS`,
  START_REQUEST = `patients/START_REQUEST`,
  UPDATE_PATIENT_ERROR = `patients/UPDATE_PATIENT_ERROR`,
  UPDATE_PATIENT_SUCCESS = `patients/UPDATE_PATIENT_SUCCESS`,
  ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS`,
  ADD_PATIENT_TO_HEALTH_FACILITY_ERROR = `patients/ADD_PATIENT_TO_HEALTH_FACILITY_ERROR`,
}

type PatientsActionPayload = { message: string };

type PatientsAction = 
  | { type: PatientsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: PatientsActionEnum.GET_PATIENTS_ERROR, payload: PatientsActionPayload }
  | { type: PatientsActionEnum.GET_PATIENTS_SUCCESS, payload: { patients: Array<Patient> } }
  | { type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_ERROR, payload: PatientsActionPayload }
  | { type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_SUCCESS, payload: { patients: Array<Patient> } }
  | { type: PatientsActionEnum.START_REQUEST }
  | { type: PatientsActionEnum.UPDATE_PATIENT_ERROR, payload: PatientsActionPayload }
  | { type: PatientsActionEnum.UPDATE_PATIENT_SUCCESS, payload: { updatedPatient: Patient } }
  | { type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS, payload: { addedPatient: Patient } }
  | { type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_ERROR, payload: PatientsActionPayload };

const startRequest = (): PatientsAction => ({ type: PatientsActionEnum.START_REQUEST }); 

type PatientsRequest = Callback<Callback<PatientsAction>, ServerRequestAction>;

export const getPatients = (search?: string): PatientsRequest => {
  return (dispatch: Callback<PatientsAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: search 
        ? `${Endpoints.PATIENTS_ALL_INFO}/${search}` 
        : Endpoints.PATIENTS_ALL_INFO,
      onSuccess: (response: { data: Array<Patient> }): PatientsAction => search ? ({
        type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_SUCCESS,
        payload: { patients: response.data },
      }) : ({
        type: PatientsActionEnum.GET_PATIENTS_SUCCESS,
        payload: { patients: response.data },
      }),
      onError: (message: string): PatientsAction => search ? ({
        type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_ERROR,
        payload: { message },
      }) : ({
        type: PatientsActionEnum.GET_PATIENTS_ERROR,
        payload: { message },
      })
    })
  };
};

export const updatePatient = (
  patientId: string, 
  updatedPatient: Patient
): PatientsRequest => {
  return (dispatch: Callback<PatientsAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: `${Endpoints.PATIENT}/${patientId}`,
      method: Methods.PUT,
      data: updatedPatient,
      onSuccess: (): PatientsAction => ({
        type: PatientsActionEnum.UPDATE_PATIENT_SUCCESS,
        payload: { updatedPatient },
      }),
      onError: (message: string): PatientsAction => ({
        type: PatientsActionEnum.UPDATE_PATIENT_ERROR,
        payload: { message },
      })
    })
  };
};

export const addPatientToHealthFacility = (patient: Patient): PatientsRequest => {
  return (dispatch: Callback<PatientsAction>): ServerRequestAction => {
    dispatch(startRequest());
  
    return serverRequestActionCreator({
      endpoint: `adding patient to health facility endpoint goes here...`,
      method: Methods.PUT,
      data: patient.patientId,
      onSuccess: () => ({
        type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS,
        payload: { patient },
      }),
      onError: (error: any) => ({
        type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_ERROR,
        payload: error,
      })
    });
  };
};

export const clearPatientsRequestOutcome = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type PatientsV2State = {
  error: boolean,
  globalSearchError: boolean,
  loading: boolean;
  message: OrNull<string>,
  patients: OrNull<Array<Patient>>,
  globalSearchPatients: OrNull<Array<GlobalSearchPatient>>,
};

const initialState: PatientsV2State = {
  error: false,
  globalSearchError: false,
  loading: false,
  message: null,
  patients: null,
  globalSearchPatients: null,
};

export const patientsReducerV2 = (
  state = initialState, 
  action: PatientsAction
): PatientsV2State => {
  switch (action.type) {
    case PatientsActionEnum.START_REQUEST:
      return { ...state, loading: true };
    case PatientsActionEnum.GET_PATIENTS_ERROR:
      return { 
        ...state,
        error: true,
        loading: false, 
        message: action.payload.message, 
      };
    case PatientsActionEnum.GET_PATIENTS_SUCCESS:
      return { 
        ...initialState,
        patients: action.payload.patients, 
      };
    case PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_ERROR:
      return { 
        ...state,
        globalSearchError: true,
        loading: false, 
        message: action.payload.message, 
      };
    case PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_SUCCESS:
      return { 
        ...initialState,
        globalSearchPatients: action.payload.patients, 
      };
    case PatientsActionEnum.UPDATE_PATIENT_ERROR:
      return { 
        ...state,
        error: true,
        loading: false, 
        message: action.payload.message, 
      };
    case PatientsActionEnum.UPDATE_PATIENT_SUCCESS:
      return { 
        ...initialState,
        message: `Patient successfully updated!`,
        patients: state.patients?.map((
          patient: Patient
        ): Patient => patient.patientId === action.payload.updatedPatient.patientId 
          ? action.payload.updatedPatient 
          : patient
        ) ?? [], 
      };
    case PatientsActionEnum.UPDATE_PATIENT_SUCCESS:
      return { ...state, loading: false };
    case PatientsActionEnum.UPDATE_PATIENT_ERROR:
    case PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_ERROR:
      return { ...state, error: true, loading: false, message: action.payload.message };
    case PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS:
      return { ...state, loading: false, patients: [action.payload.addedPatient, ...(state.patients ?? [])] };
    case PatientsActionEnum.CLEAR_REQUEST_OUTCOME:
      return { ...initialState, patients: state.patients };
    default:
      return state;
  }
};
