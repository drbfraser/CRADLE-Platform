import { Endpoints } from '../../../server/endpoints';
import { serverRequestActionCreator, ServerRequestAction } from '../utils';
import { OrNull, Patient, Callback } from '@types';

enum PatientActionEnum {
  CLEAR_REQUEST_OUTCOME = `patient/CLEAR_REQUEST_OUTCOME`,
  GET_PATIENT_ERROR = `patient/GET_PATIENT_ERROR`,
  GET_PATIENT_SUCCESS = `patient/GET_PATIENT_SUCCESS`,
  START_REQUEST = `patient/START_REQUEST`,
}

type PatientActionPayload = { message: string };

type PatientAction = 
  | { type: PatientActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: PatientActionEnum.GET_PATIENT_ERROR, payload: PatientActionPayload }
  | { type: PatientActionEnum.GET_PATIENT_SUCCESS, payload: { patient: Patient } }
  | { type: PatientActionEnum.START_REQUEST }

const startRequest = (): PatientAction => ({ type: PatientActionEnum.START_REQUEST }); 

type PatientRequest = Callback<Callback<PatientAction>, ServerRequestAction>;

export const getPatient = (patientId: string): PatientRequest => {
  return (dispatch: Callback<PatientAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: `${Endpoints.PATIENT}${Endpoints.READING}/${patientId}`,
      onSuccess: (response: { data: Patient }): PatientAction => ({
        type: PatientActionEnum.GET_PATIENT_SUCCESS,
        payload: { patient: response.data },
      }),
      onError: (message: string): PatientAction => ({
        type: PatientActionEnum.GET_PATIENT_ERROR,
        payload: { message },
      })
    })
  };
};

export const clearPatientRequestOutcome = (): PatientAction => ({
  type: PatientActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type PatientState = {
  error: boolean,
  loading: boolean;
  message: OrNull<string>,
  patient: OrNull<Patient>,
};

const initialState: PatientState = {
  error: false,
  loading: false,
  message: null,
  patient: null,
};

export const patientReducer = (
  state = initialState, 
  action: PatientAction
) => {
  switch (action.type) {
    case PatientActionEnum.START_REQUEST:
      return { ...state, loading: true };
    case PatientActionEnum.GET_PATIENT_ERROR:
      return { 
        ...state,
        error: true,
        loading: false, 
        message: action.payload.message, 
      };
    case PatientActionEnum.GET_PATIENT_SUCCESS:
      return { 
        ...initialState,
        patient: action.payload.patient, 
      };
    case PatientActionEnum.CLEAR_REQUEST_OUTCOME:
      return { ...initialState, patient: state.patient };
    default:
      return state;
  }
};
