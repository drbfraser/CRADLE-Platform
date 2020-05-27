import { Endpoints } from '@server-endpoints';
import { Methods } from '@server-methods';
import { serverRequestActionCreator, ServerRequestAction } from '../utils';
import { OrNull, Patient, Callback } from '@types';

enum PatientsActionEnum {
  ADD_PATIENT_ERROR = `patients/ADD_PATIENT_ERROR`,
  ADD_PATIENT_SUCCESS = `patients/ADD_PATIENT_SUCCESS`,
  CLEAR_REQUEST_OUTCOME = `patients/CLEAR_REQUEST_OUTCOME`,
  GET_PATIENTS_ERROR = `patients/GET_PATIENTS_ERROR`,
  GET_PATIENTS_SUCCESS = `patients/GET_PATIENTS_SUCCESS`,
  START_REQUEST = `patients/START_REQUEST`,
  UPDATE_PATIENT_ERROR = `patients/UPDATE_PATIENT_ERROR`,
  UPDATE_PATIENT_SUCCESS = `patients/UPDATE_PATIENT_SUCCESS`,
}

type PatientsActionPayload = { message: string };

type PatientsAction = 
  | { type: PatientsActionEnum.ADD_PATIENT_ERROR, payload: PatientsActionPayload }
  | { type: PatientsActionEnum.ADD_PATIENT_SUCCESS, payload: { newPatient: Patient } }
  | { type: PatientsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: PatientsActionEnum.GET_PATIENTS_ERROR, payload: PatientsActionPayload }
  | { type: PatientsActionEnum.GET_PATIENTS_SUCCESS, payload: { patients: Array<Patient> } }
  | { type: PatientsActionEnum.START_REQUEST }
  | { type: PatientsActionEnum.UPDATE_PATIENT_ERROR, payload: PatientsActionPayload }
  | { type: PatientsActionEnum.UPDATE_PATIENT_SUCCESS, payload: { updatedPatient: Patient } };

const startRequest = (): PatientsAction => ({ type: PatientsActionEnum.START_REQUEST }); 

type PatientsRequest = Callback<Callback<PatientsAction>, ServerRequestAction>;

export const addPatient = (newPatient: Patient): PatientsRequest => {
  return (dispatch: Callback<PatientsAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: `Add patient endpoint goes here`,
      method: Methods.POST,
      data: newPatient,
      onSuccess: (): PatientsAction => ({
        type: PatientsActionEnum.ADD_PATIENT_SUCCESS,
        payload: { newPatient },
      }),
      onError: (message: string): PatientsAction => ({
        type: PatientsActionEnum.ADD_PATIENT_ERROR,
        payload: { message },
      })
    })
  };
};

export const getPatients = (): PatientsRequest => {
  return (dispatch: Callback<PatientsAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: Endpoints.PATIENTS_ALL_INFO,
      onSuccess: (response: { data: Array<Patient> }): PatientsAction => ({
        type: PatientsActionEnum.GET_PATIENTS_SUCCESS,
        payload: { patients: response.data },
      }),
      onError: (message: string): PatientsAction => ({
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

export const clearPatientsRequestOutcome = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type PatientsV2State = {
  error: boolean,
  loading: boolean;
  message: OrNull<string>,
  patients: OrNull<Array<Patient>>,
};

const initialState: PatientsV2State = {
  error: false,
  loading: false,
  message: null,
  patients: null,
};

export const patientsReducerV2 = (
  state = initialState, 
  action: PatientsAction
) => {
  switch (action.type) {
    case PatientsActionEnum.START_REQUEST:
      return { ...state, loading: true };
    case PatientsActionEnum.ADD_PATIENT_ERROR:
      return { 
        ...state,
        error: true,
        loading: false, 
        message: action.payload.message, 
      };
    case PatientsActionEnum.ADD_PATIENT_SUCCESS:
      return { 
        ...initialState,
        patients: [action.payload.newPatient, ...(state.patients ?? [])], 
      };
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
    case PatientsActionEnum.CLEAR_REQUEST_OUTCOME:
      return { ...initialState, patients: state.patients };
    default:
      return state;
  }
};
