import {
  Callback,
  GlobalSearchPatient,
  NewAssessment,
  OrNull,
  Patient,
  ServerError,
} from '@types';
import { PatientStateEnum } from '../../../enums';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { EndpointEnum } from '../../../server';
import { MethodEnum } from '../../../server';
import { goBack } from 'connected-react-router';

enum PatientsActionEnum {
  GET_PATIENT_REQUESTED = 'patients/GET_PATIENT_REQUESTED',
  GET_PATIENT_SUCCESS = 'patients/GET_PATIENT_SUCCESS',
  GET_PATIENT_ERROR = 'patients/GET_PATIENT_ERROR',
  CLEAR_GET_PATIENT_ERROR = 'patients/CLEAR_GET_PATIENT_ERROR',
  UPDATE_SELECTED_PATIENT_STATE = 'patients/UPDATE_SELECTED_PATIENT_STATE',
  ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED = 'patients/ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED',
  ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS = 'patients/ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS',
  ADD_PATIENT_TO_HEALTH_FACILITY_ERROR = 'patients/ADD_PATIENT_TO_HEALTH_FACILITY_ERROR',
  CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR = 'patients/CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR',
  RESET_ADDED_FROM_GLOBAL_SEARCH = 'patients/RESET_ADDED_FROM_GLOBAL_SEARCH',
}

type ErrorPayload = { error: string };

type PatientIdPayload = { patientId: string };

export type PatientsAction =
  | { type: PatientsActionEnum.GET_PATIENT_REQUESTED }
  | {
      type: PatientsActionEnum.GET_PATIENT_SUCCESS;
      payload: { patient: Patient };
    }
  | { type: PatientsActionEnum.GET_PATIENT_ERROR; payload: ErrorPayload }
  | { type: PatientsActionEnum.CLEAR_GET_PATIENT_ERROR }
  | {
      type: PatientsActionEnum.UPDATE_SELECTED_PATIENT_STATE;
      payload: { state?: PatientStateEnum };
    }
  | {
      type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED;
      payload: PatientIdPayload;
    }
  | {
      type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS;
      payload: PatientIdPayload;
    }
  | {
      type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_ERROR;
      payload: ErrorPayload & { patientId: string };
    }
  | {
      type: PatientsActionEnum.CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR;
    }
  | {
      type: PatientsActionEnum.RESET_ADDED_FROM_GLOBAL_SEARCH;
    };

export const clearGetPatientError = (): Callback<Dispatch, PatientsAction> => {
  return (dispatch: Dispatch): PatientsAction => {
    dispatch(goBack());
    return dispatch({
      type: PatientsActionEnum.CLEAR_GET_PATIENT_ERROR,
    });
  };
};

export const updateSelectedPatientState = (
  state?: PatientStateEnum
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_SELECTED_PATIENT_STATE,
  payload: { state },
});

const getPatientRequested = (): PatientsAction => ({
  type: PatientsActionEnum.GET_PATIENT_REQUESTED,
});

export const getPatient = (
  patientId: string
): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch): ServerRequestAction => {
    dispatch(getPatientRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${EndpointEnum.PATIENTS}/${patientId}`,
        onSuccess: (response: { data: Patient }): PatientsAction => {
          return {
            type: PatientsActionEnum.GET_PATIENT_SUCCESS,
            payload: { patient: response.data },
          };
        },
        onError: ({ message }: ServerError): PatientsAction => ({
          type: PatientsActionEnum.GET_PATIENT_ERROR,
          payload: { error: message },
        }),
      })
    );
  };
};

const addPatientToHealthFacilityRequested = (
  patientId: string
): PatientsAction => ({
  type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED,
  payload: { patientId },
});

export const clearAddPatientToHealthFacilityError = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR,
});

export const addPatientToHealthFacility = (
  patientId: string
): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch): ServerRequestAction => {
    dispatch(clearAddPatientToHealthFacilityError());

    dispatch(addPatientToHealthFacilityRequested(patientId));

    return dispatch(
      serverRequestActionCreator({
        endpoint: EndpointEnum.PATIENT_ASSOCIATIONS,
        method: MethodEnum.POST,
        data: { patientId },
        onSuccess: (): PatientsAction => ({
          type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS,
          payload: { patientId },
        }),
        onError: ({ message }: ServerError): PatientsAction => ({
          type: PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_ERROR,
          payload: { error: message, patientId },
        }),
      })
    );
  };
};

export const resetAddedFromGlobalSearch = (): PatientsAction => ({
  type: PatientsActionEnum.RESET_ADDED_FROM_GLOBAL_SEARCH,
});

export interface ICreateAssessmentArgs {
  data: NewAssessment;
  readingId: string;
  userId: number;
}

export type PatientsState = {
  addedFromGlobalSearch: boolean;
  addingFromGlobalSearchError: OrNull<string>;
  error: OrNull<string>;
  patient: OrNull<Patient>;
  globalSearchPatientsList: OrNull<Array<GlobalSearchPatient>>;
  isLoading: boolean;
  addingFromGlobalSearch: boolean;
  selectedPatientState?: PatientStateEnum;
};

const initialState: PatientsState = {
  addedFromGlobalSearch: false,
  addingFromGlobalSearchError: null,
  error: null,
  patient: null,
  globalSearchPatientsList: null,
  isLoading: false,
  addingFromGlobalSearch: false,
  selectedPatientState: undefined,
};

export const patientsReducer = (
  state = initialState,
  action: PatientsAction
): PatientsState => {
  let patientToAdd: OrNull<GlobalSearchPatient> = null;
  let updatedPatients: Array<GlobalSearchPatient> = [];

  switch (action.type) {
    case PatientsActionEnum.CLEAR_GET_PATIENT_ERROR:
      return {
        ...state,
        error: null,
      };
    case PatientsActionEnum.CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR:
      return {
        ...state,
        addingFromGlobalSearchError: null,
      };
    case PatientsActionEnum.GET_PATIENT_SUCCESS:
      return {
        ...state,
        patient: action.payload.patient,
        isLoading: false,
      };
    case PatientsActionEnum.GET_PATIENT_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };
    case PatientsActionEnum.GET_PATIENT_ERROR:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };
    case PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED:
      return {
        ...state,
        globalSearchPatientsList: (state.globalSearchPatientsList ?? []).map(
          (patient: GlobalSearchPatient): GlobalSearchPatient => {
            return patient.patientId === action.payload.patientId
              ? { ...patient, state: PatientStateEnum.ADDING }
              : patient;
          }
        ),
        addingFromGlobalSearch: true,
      };
    case PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS:
      updatedPatients = (state.globalSearchPatientsList ?? []).map(
        (patient: GlobalSearchPatient): GlobalSearchPatient => {
          if (patient.patientId === action.payload.patientId) {
            patientToAdd = {
              ...patient,
              state: PatientStateEnum.JUST_ADDED,
            } as GlobalSearchPatient;
            return patientToAdd;
          }

          return patient;
        }
      );

      if (patientToAdd === null && state.globalSearchPatientsList !== null) {
        return state;
      }

      return {
        ...state,
        addedFromGlobalSearch: true,
        addingFromGlobalSearch: false,
        globalSearchPatientsList: updatedPatients,
      };
    case PatientsActionEnum.ADD_PATIENT_TO_HEALTH_FACILITY_ERROR:
      return {
        ...state,
        addingFromGlobalSearchError: action.payload.error,
        addingFromGlobalSearch: false,
        globalSearchPatientsList: state.globalSearchPatientsList!.map(
          (patient: GlobalSearchPatient): GlobalSearchPatient => {
            if (patient.patientId === action.payload.patientId) {
              return { ...patient, state: PatientStateEnum.ADD };
            }

            return patient;
          }
        ),
      };
    case PatientsActionEnum.RESET_ADDED_FROM_GLOBAL_SEARCH:
      return {
        ...state,
        addedFromGlobalSearch: false,
        addingFromGlobalSearchError: null,
      };
    case PatientsActionEnum.UPDATE_SELECTED_PATIENT_STATE:
      return {
        ...state,
        selectedPatientState: action.payload.state,
      };
    default:
      return state;
  }
};
