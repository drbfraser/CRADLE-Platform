import {
  Callback,
  FollowUp,
  GlobalSearchPatient,
  NewAssessment,
  OrNull,
  Patient,
  Reading,
  Referral,
  ServerError,
} from '@types';
import {
  GestationalAgeUnitEnum,
  PatientStateEnum,
  SexEnum,
} from '../../../enums';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';
import {
  calculateShockIndex,
  sortPatientsByLastReading,
} from '../../../shared/utils';

import { Dispatch } from 'redux';
import { EndpointEnum } from '../../../server';
import { MethodEnum } from '../../../server';
import { formatPatientData } from '../../../pages/newReading/formatData';
import { getPatientsWithReferrals } from './utils';
import { goBack } from 'connected-react-router';

enum PatientsActionEnum {
  GET_PATIENT_REQUESTED = 'patients/GET_PATIENT_REQUESTED',
  GET_PATIENT_SUCCESS = 'patients/GET_PATIENT_SUCCESS',
  GET_PATIENT_ERROR = 'patients/GET_PATIENT_ERROR',
  CLEAR_GET_PATIENT_ERROR = 'patients/CLEAR_GET_PATIENT_ERROR',
  GET_PATIENTS_REQUESTED = 'patient/GET_PATIENTS_REQUESTED',
  GET_PATIENTS_TABLE_PATIENTS_SUCCESS = 'patients/GET_PATIENTS_SUCCESS',
  GET_PATIENTS_TABLE_PATIENTS_ERROR = 'patient/GET_PATIENTS_ERROR',
  CLEAR_GET_PATIENTS_ERROR = 'patients/CLEAR_GET_PATIENTS_ERROR',
  GET_REFERRALS_TABLE_PATIENTS_REQUESTED = 'patient/GET_REFERRALS_TABLE_PATIENTS_REQUESTED',
  GET_REFERRALS_TABLE_PATIENTS_SUCCESS = 'patients/GET_REFERRALS_TABLE_PATIENTS_SUCCESS',
  GET_REFERRALS_TABLE_PATIENTS_ERROR = 'patient/GET_REFERRALS_TABLE_PATIENTS_ERROR',
  CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR = 'patients/CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR',
  GET_GLOBAL_SEARCH_PATIENTS_SUCCESS = 'patients/GET_GLOBAL_SEARCH_PATIENTS',
  GET_GLOBAL_SEARCH_PATIENTS_ERROR = 'patient/GET_GLOBAL_SEARCH_PATIENTS_ERROR',
  TOGGLE_GLOBAL_SEARCH = 'patients/TOGGLE_GLOBAL_SEARCH',
  UPDATE_PATIENTS_TABLE_PAGE_NUMBER = 'patients/UPDATE_PATIENTS_TABLE_PAGE_NUMBER',
  UPDATE_REFERRALS_TABLE_PAGE_NUMBER = 'patients/UPDATE_REFERRALS_TABLE_PAGE_NUMBER',
  UPDATE_PATIENTS_TABLE_SEARCH_TEXT = 'patients/UPDATE_PATIENTS_TABLE_SEARCH_TEXT',
  UPDATE_REFERRALS_TABLE_SEARCH_TEXT = 'patients/UPDATE_REFERRALS_TABLE_SEARCH_TEXT',
  UPDATE_PATIENTS_TABLE_ROWS_PER_PAGE = 'patients/UPDATE_PATIENTS_TABLE_ROWS_PER_PAGE',
  UPDATE_REFERRALS_TABLE_ROWS_PER_PAGE = 'patients/UPDATE_REFERRALS_TABLE_ROWS_PER_PAGE',
  UPDATE_SELECTED_PATIENT_STATE = 'patients/UPDATE_SELECTED_PATIENT_STATE',
  SORT_PATIENTS_TABLE_PATIENTS = 'patients/SORT_PATIENTS_TABLE_PATIENTS',
  SORT_REFERRALS_TABLE_PATIENTS = 'patients/SORT_REFERRALS_TABLE_PATIENTS',
  UPDATE_PATIENT_REQUESTED = 'patient/UPDATE_PATIENT_REQUESTED',
  UPDATE_PATIENT_SUCCESS = 'patient/UPDATE_PATIENT_SUCCESS',
  UPDATE_PATIENT_ERROR = 'patients/UPDATE_PATIENT_ERROR',
  CLEAR_UPDATE_PATIENT_REQUEST_OUTCOME = 'patients/CLEAR_UPDATE_PATIENT_REQUEST_OUTCOME',
  ADD_NEW_PATIENT = 'patients/ADD_NEW_PATIENT',
  AFTER_NEW_PATIENT_ADDED = 'patients/AFTER_NEW_PATIENT_ADDED',
  AFTER_NEW_READING_ADDED = 'patients/AFTER_NEW_READING_ADDED',
  RESET_PATIENT_UPDATED = 'patients/RESET_PATIENT_UPDATED',
  ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED = 'patients/ADD_PATIENT_TO_HEALTH_FACILITY_REQUESTED',
  ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS = 'patients/ADD_PATIENT_TO_HEALTH_FACILITY_SUCCESS',
  ADD_PATIENT_TO_HEALTH_FACILITY_ERROR = 'patients/ADD_PATIENT_TO_HEALTH_FACILITY_ERROR',
  CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR = 'patients/CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR',
  RESET_ADDED_FROM_GLOBAL_SEARCH = 'patients/RESET_ADDED_FROM_GLOBAL_SEARCH',
  CREATE_ASSESSMENT_REQUESTED = 'patients/CREATE_ASSESSMENT_REQUESTED',
  CREATE_ASSESSMENT_SUCCESS = 'patients/CREATE_ASSESSMENT_SUCCESS',
  CREATE_ASSESSMENT_ERROR = 'patients/CREATE_ASSESSMENT_ERROR',
  CLEAR_CREATE_ASSESSMENT_REQUEST_OUTCOME = 'patients/CLEAR_CREATE_ASSESSMENT_OUTCOME',
  UPDATE_ASSESSMENT_REQUESTED = 'patients/UPDATE_ASSESSMENT_REQUESTED',
  UPDATE_ASSESSMENT_SUCCESS = 'patients/UPDATE_ASSESSMENT_SUCCESS',
  UPDATE_ASSESSMENT_ERROR = 'patients/UPDATE_ASSESSMENT_ERROR',
  CLEAR_UPDATE_ASSESSMENT_REQUEST_OUTCOME = 'patients/CLEAR_UPDATE_ASSESSMENT_REQUEST_OUTCOME',
  UPDATE_TABLE_DATA_ON_SELECTED_PATIENT_CHANGE = 'patients/UPDATE_TABLE_DATA_ON_SELECTED_PATIENT_CHANGE',
  DOES_PATIENT_EXIST = 'patients/DOES_PATIENT_EXIST',
  DOES_PATIENT_EXIST_ERROR = 'patients/DOES_PATIENT_EXIST_ERROR',
  AFTER_DOES_PATIENT_EXIST = 'patients/AFTER_DOES_PATIENT_EXIST',
  ADD_NEW_PATIENT_NEW_API = 'patients/ADD_NEW_PATIENT_NEW_API',
}

type PageNumberPayload = { pageNumber: number };

type RowsPerPagePayload = { rowsPerPage: number };

type SearchTextPayload = { searchText?: string };

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
  | { type: PatientsActionEnum.GET_PATIENTS_REQUESTED }
  | {
      type: PatientsActionEnum.GET_PATIENTS_TABLE_PATIENTS_SUCCESS;
      payload: { patients: Array<Patient> };
    }
  | {
      type: PatientsActionEnum.GET_PATIENTS_TABLE_PATIENTS_ERROR;
      payload: ErrorPayload;
    }
  | { type: PatientsActionEnum.CLEAR_GET_PATIENTS_ERROR }
  | { type: PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_REQUESTED }
  | {
      type: PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_SUCCESS;
      payload: { patients: Array<Patient> };
    }
  | {
      type: PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_ERROR;
      payload: ErrorPayload;
    }
  | {
      type: PatientsActionEnum.CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR;
    }
  | {
      type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_SUCCESS;
      payload: { globalSearchPatients: Array<GlobalSearchPatient> };
    }
  | {
      type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_ERROR;
      payload: ErrorPayload;
    }
  | {
      type: PatientsActionEnum.TOGGLE_GLOBAL_SEARCH;
      payload: { globalSearch: boolean };
    }
  | {
      type: PatientsActionEnum.UPDATE_PATIENTS_TABLE_PAGE_NUMBER;
      payload: PageNumberPayload;
    }
  | {
      type: PatientsActionEnum.UPDATE_REFERRALS_TABLE_PAGE_NUMBER;
      payload: PageNumberPayload;
    }
  | {
      type: PatientsActionEnum.UPDATE_PATIENTS_TABLE_SEARCH_TEXT;
      payload: SearchTextPayload;
    }
  | {
      type: PatientsActionEnum.UPDATE_REFERRALS_TABLE_SEARCH_TEXT;
      payload: SearchTextPayload;
    }
  | {
      type: PatientsActionEnum.UPDATE_PATIENTS_TABLE_ROWS_PER_PAGE;
      payload: RowsPerPagePayload;
    }
  | {
      type: PatientsActionEnum.UPDATE_REFERRALS_TABLE_ROWS_PER_PAGE;
      payload: RowsPerPagePayload;
    }
  | {
      type: PatientsActionEnum.UPDATE_SELECTED_PATIENT_STATE;
      payload: { state?: PatientStateEnum };
    }
  | {
      type: PatientsActionEnum.SORT_PATIENTS_TABLE_PATIENTS;
      payload: { sortedPatients: Array<Patient> | Array<GlobalSearchPatient> };
    }
  | {
      type: PatientsActionEnum.SORT_REFERRALS_TABLE_PATIENTS;
      payload: { sortedPatients: Array<Patient> };
    }
  | { type: PatientsActionEnum.UPDATE_PATIENT_REQUESTED }
  | {
      type: PatientsActionEnum.UPDATE_PATIENT_SUCCESS;
      payload: { updatedPatient: ReturnType<typeof formatPatientData> };
    }
  | {
      type: PatientsActionEnum.UPDATE_PATIENT_ERROR;
      payload: { error: ServerError };
    }
  | { type: PatientsActionEnum.CLEAR_UPDATE_PATIENT_REQUEST_OUTCOME }
  | {
      type: PatientsActionEnum.ADD_NEW_PATIENT;
      payload: { newPatient: Patient };
    }
  | { type: PatientsActionEnum.AFTER_NEW_PATIENT_ADDED }
  | {
      type: PatientsActionEnum.AFTER_NEW_READING_ADDED;
      payload: { reading: Reading };
    }
  | { type: PatientsActionEnum.RESET_PATIENT_UPDATED }
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
    }
  | { type: PatientsActionEnum.CREATE_ASSESSMENT_REQUESTED }
  | {
      type: PatientsActionEnum.CREATE_ASSESSMENT_SUCCESS;
      payload: { readingId: string; followup: FollowUp };
    }
  | { type: PatientsActionEnum.CREATE_ASSESSMENT_ERROR; payload: ErrorPayload }
  | { type: PatientsActionEnum.CLEAR_CREATE_ASSESSMENT_REQUEST_OUTCOME }
  | { type: PatientsActionEnum.UPDATE_ASSESSMENT_REQUESTED }
  | {
      type: PatientsActionEnum.UPDATE_ASSESSMENT_SUCCESS;
      payload: { readingId: string; followup: FollowUp };
    }
  | { type: PatientsActionEnum.UPDATE_ASSESSMENT_ERROR; payload: ErrorPayload }
  | { type: PatientsActionEnum.CLEAR_UPDATE_ASSESSMENT_REQUEST_OUTCOME }
  | { type: PatientsActionEnum.UPDATE_TABLE_DATA_ON_SELECTED_PATIENT_CHANGE }
  | { type: PatientsActionEnum.DOES_PATIENT_EXIST; payload: { data: any } }
  | {
      type: PatientsActionEnum.DOES_PATIENT_EXIST_ERROR;
      payload: ErrorPayload;
    }
  | {
      type: PatientsActionEnum.AFTER_DOES_PATIENT_EXIST;
    }
  | {
      type: PatientsActionEnum.ADD_NEW_PATIENT_NEW_API;
      payload: { data: any };
    };

export const clearGetPatientError = (): Callback<Dispatch, PatientsAction> => {
  return (dispatch: Dispatch): PatientsAction => {
    dispatch(goBack());
    return dispatch({
      type: PatientsActionEnum.CLEAR_GET_PATIENT_ERROR,
    });
  };
};

export const clearGetPatientsError = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_GET_PATIENTS_ERROR,
});

export const clearGetReferralsTablePatientsError = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR,
});

export const clearUpdatePatientOutcome = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_UPDATE_PATIENT_REQUEST_OUTCOME,
});

export const toggleGlobalSearch = (globalSearch: boolean): PatientsAction => ({
  type: PatientsActionEnum.TOGGLE_GLOBAL_SEARCH,
  payload: { globalSearch },
});

export const updatePatientsTablePageNumber = (
  pageNumber: number
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_PATIENTS_TABLE_PAGE_NUMBER,
  payload: { pageNumber },
});

export const updateReferralsTablePageNumber = (
  pageNumber: number
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_REFERRALS_TABLE_PAGE_NUMBER,
  payload: { pageNumber },
});

export const updatePatientsTableSearchText = (
  searchText?: string
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_PATIENTS_TABLE_SEARCH_TEXT,
  payload: { searchText },
});

export const updateReferralsTableSearchText = (
  searchText?: string
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_REFERRALS_TABLE_SEARCH_TEXT,
  payload: { searchText },
});

export const updatePatientsTableRowsPerPage = (
  rowsPerPage: number
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_PATIENTS_TABLE_ROWS_PER_PAGE,
  payload: { rowsPerPage },
});

export const updateReferralsTableRowsPerPage = (
  rowsPerPage: number
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_REFERRALS_TABLE_ROWS_PER_PAGE,
  payload: { rowsPerPage },
});

export const updateSelectedPatientState = (
  state?: PatientStateEnum
): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_SELECTED_PATIENT_STATE,
  payload: { state },
});

export const sortPatientsTablePatients = (
  sortedPatients: Array<Patient> | Array<GlobalSearchPatient>
): PatientsAction => ({
  type: PatientsActionEnum.SORT_PATIENTS_TABLE_PATIENTS,
  payload: { sortedPatients },
});

export const sortReferralsTablePatients = (
  sortedPatients: Array<Patient>
): PatientsAction => ({
  type: PatientsActionEnum.SORT_REFERRALS_TABLE_PATIENTS,
  payload: { sortedPatients },
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

const getPatientsRequested = (): PatientsAction => ({
  type: PatientsActionEnum.GET_PATIENTS_REQUESTED,
});

export const getPatientsTablePatients = (
  search?: string
): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch): ServerRequestAction => {
    dispatch(getPatientsRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: search
          ? `${EndpointEnum.PATIENTS_GLOBAL_SEARCH}/${search}`
          : EndpointEnum.PATIENTS_ALL_INFO,
        onSuccess: ({
          data,
        }: {
          data: Array<Patient> | Array<GlobalSearchPatient>;
        }): PatientsAction => {
          return search
            ? {
                type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_SUCCESS,
                payload: {
                  globalSearchPatients: data as Array<GlobalSearchPatient>,
                },
              }
            : {
                type: PatientsActionEnum.GET_PATIENTS_TABLE_PATIENTS_SUCCESS,
                payload: { patients: data as Array<Patient> },
              };
        },
        onError: ({ message }: ServerError): PatientsAction => {
          return search
            ? {
                type: PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_ERROR,
                payload: { error: message },
              }
            : {
                type: PatientsActionEnum.GET_PATIENTS_TABLE_PATIENTS_ERROR,
                payload: { error: message },
              };
        },
      })
    );
  };
};

const getReferralsTablePatientsRequested = (): PatientsAction => ({
  type: PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_REQUESTED,
});

export const getReferralsTablePatients = (): Callback<
  Dispatch,
  ServerRequestAction
> => {
  return (dispatch: Dispatch): ServerRequestAction => {
    dispatch(getReferralsTablePatientsRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: EndpointEnum.PATIENTS_ALL_INFO,
        onSuccess: ({ data }: { data: Array<Patient> }): PatientsAction => ({
          type: PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_SUCCESS,
          payload: { patients: data },
        }),
        onError: ({ message }: ServerError): PatientsAction => {
          return {
            type: PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_ERROR,
            payload: { error: message },
          };
        },
      })
    );
  };
};

const updatePatientRequested = (): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_PATIENT_REQUESTED,
});

export interface IUpdatePatientArgs {
  data: ReturnType<typeof formatPatientData>;
}

export const updatePatient = ({
  data,
}: IUpdatePatientArgs): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch) => {
    dispatch(updatePatientRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${EndpointEnum.PATIENTS}/${data.patientId}${EndpointEnum.INFO}`,
        method: MethodEnum.PUT,
        data,
        onSuccess: (): PatientsAction => ({
          type: PatientsActionEnum.UPDATE_PATIENT_SUCCESS,
          payload: {
            updatedPatient: {
              ...data,
              gestationalTimestamp: data.gestationalTimestamp * 1000,
            },
          },
        }),
        onError: (error: ServerError): PatientsAction => ({
          type: PatientsActionEnum.UPDATE_PATIENT_ERROR,
          payload: { error },
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
        endpoint: EndpointEnum.PATIENT_FACILITY,
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

export const addNewPatient = (newPatient: Patient): PatientsAction => ({
  type: PatientsActionEnum.ADD_NEW_PATIENT,
  payload: { newPatient },
});

export const afterNewPatientAdded = (): PatientsAction => ({
  type: PatientsActionEnum.AFTER_NEW_PATIENT_ADDED,
});

export const afterNewReadingAdded = (reading: Reading): PatientsAction => {
  // * Create traffic light status for newly created reading
  reading.trafficLightStatus = calculateShockIndex(reading);

  return {
    type: PatientsActionEnum.AFTER_NEW_READING_ADDED,
    payload: { reading },
  };
};

export const resetPatientUpdated = (): PatientsAction => ({
  type: PatientsActionEnum.RESET_PATIENT_UPDATED,
});

const createAssessmentRequested = (): PatientsAction => ({
  type: PatientsActionEnum.CREATE_ASSESSMENT_REQUESTED,
});

export interface ICreateAssessmentArgs {
  data: NewAssessment;
  readingId: string;
  userId: number;
}

export const createAssessment = ({
  data,
  readingId,
  userId,
}: ICreateAssessmentArgs): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch): ServerRequestAction => {
    dispatch(createAssessmentRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: EndpointEnum.ASSESSMENTS,
        method: MethodEnum.POST,
        data: { ...data, readingId },
        onSuccess: ({ data: id }: { data: number }): PatientsAction => ({
          type: PatientsActionEnum.CREATE_ASSESSMENT_SUCCESS,
          payload: {
            readingId,
            followup: {
              ...data,
              id,
              dateAssessed: Date.now() / 1000,
              healthcareWorkerId: userId.toString(),
              readingId,
            },
          },
        }),
        onError: ({ message }: ServerError): PatientsAction => ({
          type: PatientsActionEnum.CREATE_ASSESSMENT_ERROR,
          payload: { error: message },
        }),
      })
    );
  };
};

export const clearCreateAssessmentOutcome = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_CREATE_ASSESSMENT_REQUEST_OUTCOME,
});

const updateAssessmentRequested = (): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_ASSESSMENT_REQUESTED,
});

export interface IUpdateAssessmentArgs extends ICreateAssessmentArgs {
  data: NewAssessment & { id: number };
}

export const updateAssessment = ({
  data,
  readingId,
  userId,
}: IUpdateAssessmentArgs): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch) => {
    dispatch(updateAssessmentRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${EndpointEnum.FOLLOW_UP}/${data.id}`,
        method: MethodEnum.PUT,
        data,
        onSuccess: (): PatientsAction => ({
          type: PatientsActionEnum.UPDATE_ASSESSMENT_SUCCESS,
          payload: {
            readingId,
            followup: {
              ...data,
              dateAssessed: Date.now() / 1000,
              healthcareWorkerId: userId.toString(),
              readingId,
            },
          },
        }),
        onError: ({ message }: ServerError): PatientsAction => ({
          type: PatientsActionEnum.UPDATE_ASSESSMENT_ERROR,
          payload: { error: message },
        }),
      })
    );
  };
};

export const doesPatientExist = (patientId: any) => {
  return serverRequestActionCreator({
    endpoint: `${EndpointEnum.PATIENTS}/${patientId}`,
    onSuccess: ({ data }: any): PatientsAction => ({
      type: PatientsActionEnum.DOES_PATIENT_EXIST,
      payload: { data },
    }),
    onError: ({ message }: ServerError): PatientsAction => ({
      type: PatientsActionEnum.DOES_PATIENT_EXIST_ERROR,
      payload: { error: message },
    }),
  });
};

export const clearUpdateAssessmentOutcome = (): PatientsAction => ({
  type: PatientsActionEnum.CLEAR_UPDATE_ASSESSMENT_REQUEST_OUTCOME,
});

export const updateTableDataOnSelectedPatientChange = (): PatientsAction => ({
  type: PatientsActionEnum.UPDATE_TABLE_DATA_ON_SELECTED_PATIENT_CHANGE,
});

export const afterDoesPatientExist = (): PatientsAction => ({
  type: PatientsActionEnum.AFTER_DOES_PATIENT_EXIST,
});

export const addPatientNew = (patient: any) => {
  return serverRequestActionCreator({
    endpoint: `${EndpointEnum.PATIENTS}`,
    method: MethodEnum.POST,
    data: patient,
    onSuccess: () => ({
      type: PatientsActionEnum.ADD_NEW_PATIENT_NEW_API,
    }),
    onError: ({ message }: ServerError) => ({
      type: PatientsActionEnum.GET_PATIENT_ERROR,
      payload: { message },
    }),
  });
};

export type PatientsState = {
  addedFromGlobalSearch: boolean;
  addingFromGlobalSearchError: OrNull<string>;
  existingPatient: any;
  error: OrNull<string>;
  success: OrNull<string>;
  preventFetch: boolean;
  patient: OrNull<Patient>;
  patientUpdated: boolean;
  globalSearch: boolean;
  globalSearchPatientsList: OrNull<Array<GlobalSearchPatient>>;
  patientExist: boolean;
  patientsList: OrNull<any>;
  referralsTablePatientsList: OrNull<Array<Patient>>;
  isLoading: boolean;
  addingFromGlobalSearch: boolean;
  newPatientAdded: boolean;
  patientsTablePageNumber: number;
  referralsTablePageNumber: number;
  patientsTableRowsPerPage: number;
  referralsTableRowsPerPage: number;
  selectedPatientState?: PatientStateEnum;
  patientsTableSearchText?: string;
  referralsTableSearchText?: string;
  showReferredPatients?: boolean;
};

const initialState: PatientsState = {
  addedFromGlobalSearch: false,
  addingFromGlobalSearchError: null,
  existingPatient: null,
  error: null,
  success: null,
  preventFetch: false,
  patient: null,
  patientUpdated: false,
  globalSearch: false,
  globalSearchPatientsList: null,
  patientExist: false,
  patientsList: null,
  referralsTablePatientsList: null,
  isLoading: false,
  addingFromGlobalSearch: false,
  newPatientAdded: false,
  patientsTablePageNumber: 0,
  referralsTablePageNumber: 0,
  patientsTableRowsPerPage: 10,
  referralsTableRowsPerPage: 10,
  selectedPatientState: undefined,
  patientsTableSearchText: undefined,
  referralsTableSearchText: undefined,
  showReferredPatients: undefined,
};

export const patientsReducer = (
  state = initialState,
  action: PatientsAction
): PatientsState => {
  let patientToAdd: OrNull<GlobalSearchPatient> = null;
  let updatedPatients: Array<GlobalSearchPatient> = [];

  switch (action.type) {
    case PatientsActionEnum.GET_PATIENTS_REQUESTED:
    case PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_REQUESTED:
    case PatientsActionEnum.UPDATE_PATIENT_REQUESTED:
    case PatientsActionEnum.CREATE_ASSESSMENT_REQUESTED:
    case PatientsActionEnum.UPDATE_ASSESSMENT_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };
    case PatientsActionEnum.GET_PATIENTS_TABLE_PATIENTS_SUCCESS:
      return {
        ...state,
        patientsList: action.payload.patients.sort(
          (patient: Patient, otherPatient: Patient) => {
            return sortPatientsByLastReading(patient, otherPatient);
          }
        ),
        isLoading: false,
      };
    case PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_SUCCESS:
      return {
        ...state,
        referralsTablePatientsList: getPatientsWithReferrals(
          action.payload.patients.sort(
            (patient: Patient, otherPatient: Patient) => {
              return sortPatientsByLastReading(patient, otherPatient);
            }
          )
        ),
        isLoading: false,
      };
    case PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_SUCCESS:
      return {
        ...state,
        globalSearchPatientsList: action.payload.globalSearchPatients.sort(
          (patient: GlobalSearchPatient, otherPatient: GlobalSearchPatient) => {
            return sortPatientsByLastReading(patient, otherPatient);
          }
        ),
        isLoading: false,
      };
    case PatientsActionEnum.UPDATE_PATIENT_SUCCESS: {
      return {
        ...state,
        success: `Patient updated successfully!`,
        patientUpdated: true,
        patient: {
          ...(state.patient as Patient),
          ...action.payload.updatedPatient,
          gestationalAgeUnit: action.payload.updatedPatient
            .gestationalAgeUnit as GestationalAgeUnitEnum,
          patientSex: action.payload.updatedPatient.patientSex as SexEnum,
          readings: state.patient?.readings ?? [],
        },
        isLoading: false,
      };
    }
    case PatientsActionEnum.CREATE_ASSESSMENT_SUCCESS:
    case PatientsActionEnum.UPDATE_ASSESSMENT_SUCCESS:
      return {
        ...state,
        success: `Assessment ${
          action.type === PatientsActionEnum.CREATE_ASSESSMENT_SUCCESS
            ? `created`
            : `updated`
        } successfuly!`,
        patient: state.patient
          ? {
              ...state.patient,
              readings:
                state.patient?.readings.map(
                  (reading: Reading): Reading => {
                    if (reading.readingId === action.payload.readingId) {
                      return {
                        ...reading,
                        referral: {
                          ...(reading.referral as Referral),
                          isAssessed: true,
                        },
                        followup: action.payload.followup,
                      };
                    }

                    return reading;
                  }
                ) ?? [],
            }
          : null,
        isLoading: false,
      };
    case PatientsActionEnum.GET_PATIENTS_TABLE_PATIENTS_ERROR:
    case PatientsActionEnum.GET_REFERRALS_TABLE_PATIENTS_ERROR:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
        preventFetch: true,
      };
    case PatientsActionEnum.CREATE_ASSESSMENT_ERROR:
    case PatientsActionEnum.UPDATE_ASSESSMENT_ERROR:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };
    case PatientsActionEnum.UPDATE_PATIENT_ERROR:
      return {
        ...state,
        error: action.payload.error.message,
        isLoading: false,
        preventFetch: action.payload.error.status === 401,
      };
    case PatientsActionEnum.CLEAR_GET_PATIENT_ERROR:
    case PatientsActionEnum.CLEAR_GET_PATIENTS_ERROR:
    case PatientsActionEnum.CLEAR_GET_REFERRALS_TABLE_PATIENTS_ERROR:
      return {
        ...state,
        error: null,
      };
    case PatientsActionEnum.CLEAR_ADD_PATIENT_TO_HEALTH_FACILITY_ERROR:
      return {
        ...state,
        addingFromGlobalSearchError: null,
      };
    case PatientsActionEnum.CLEAR_UPDATE_PATIENT_REQUEST_OUTCOME:
    case PatientsActionEnum.CLEAR_CREATE_ASSESSMENT_REQUEST_OUTCOME:
    case PatientsActionEnum.CLEAR_UPDATE_ASSESSMENT_REQUEST_OUTCOME:
      return {
        ...state,
        error: null,
        success: null,
      };
    case PatientsActionEnum.GET_GLOBAL_SEARCH_PATIENTS_ERROR:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
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
    case PatientsActionEnum.ADD_NEW_PATIENT:
      return {
        ...state,
        patientsList: [
          action.payload.newPatient,
          ...(state.patientsList ?? []),
        ],
        newPatientAdded: true,
      };
    case PatientsActionEnum.AFTER_NEW_PATIENT_ADDED:
      return {
        ...state,
        newPatientAdded: false,
      };
    case PatientsActionEnum.AFTER_NEW_READING_ADDED:
      return {
        ...state,
        patientUpdated: true,
        patient: {
          ...(state.patient as Patient),
          readings: [
            action.payload.reading,
            ...(state.patient?.readings ?? []),
          ],
        },
      };
    case PatientsActionEnum.RESET_PATIENT_UPDATED:
      return {
        ...state,
        patientUpdated: false,
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
        patientsList:
          patientToAdd && state.patientsList
            ? [patientToAdd, ...state.patientsList]
            : state.patientsList,
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
    case PatientsActionEnum.TOGGLE_GLOBAL_SEARCH:
      return {
        ...state,
        globalSearch: action.payload.globalSearch,
      };
    case PatientsActionEnum.UPDATE_PATIENTS_TABLE_PAGE_NUMBER:
      return {
        ...state,
        patientsTablePageNumber: action.payload.pageNumber,
      };
    case PatientsActionEnum.UPDATE_REFERRALS_TABLE_PAGE_NUMBER:
      return {
        ...state,
        referralsTablePageNumber: action.payload.pageNumber,
      };
    case PatientsActionEnum.UPDATE_PATIENTS_TABLE_SEARCH_TEXT:
      return {
        ...state,
        patientsTableSearchText: action.payload.searchText,
      };
    case PatientsActionEnum.UPDATE_REFERRALS_TABLE_SEARCH_TEXT:
      return {
        ...state,
        referralsTableSearchText: action.payload.searchText,
      };
    case PatientsActionEnum.UPDATE_PATIENTS_TABLE_ROWS_PER_PAGE:
      return {
        ...state,
        patientsTableRowsPerPage: action.payload.rowsPerPage,
      };
    case PatientsActionEnum.UPDATE_REFERRALS_TABLE_ROWS_PER_PAGE:
      return {
        ...state,
        referralsTableRowsPerPage: action.payload.rowsPerPage,
      };
    case PatientsActionEnum.UPDATE_SELECTED_PATIENT_STATE:
      return {
        ...state,
        selectedPatientState: action.payload.state,
      };
    case PatientsActionEnum.SORT_PATIENTS_TABLE_PATIENTS:
      return state.globalSearch
        ? {
            ...state,
            globalSearchPatientsList: action.payload
              .sortedPatients as Array<GlobalSearchPatient>,
          }
        : {
            ...state,
            patientsList: action.payload.sortedPatients as Array<Patient>,
          };
    case PatientsActionEnum.SORT_REFERRALS_TABLE_PATIENTS:
      return {
        ...state,
        referralsTablePatientsList: action.payload.sortedPatients,
      };
    case PatientsActionEnum.UPDATE_TABLE_DATA_ON_SELECTED_PATIENT_CHANGE:
      return {
        ...state,
        referralsTablePatientsList:
          state.referralsTablePatientsList?.map(
            (patient: Patient): Patient => {
              if (patient.patientId === state.patient?.patientId) {
                return {
                  ...patient,
                  readings: patient.readings.map(
                    (reading: Reading): Reading => ({
                      ...reading,
                      dateReferred: reading.dateReferred,
                      followup:
                        state.patient?.readings.find(
                          ({ readingId }: Reading): boolean =>
                            readingId === reading.readingId
                        )?.followup ?? null,
                    })
                  ),
                };
              }

              return patient;
            }
          ) ?? [],
      };
    case PatientsActionEnum.DOES_PATIENT_EXIST:
      return {
        ...state,
        existingPatient: action.payload.data,
        patientExist: true,
      };
    case PatientsActionEnum.DOES_PATIENT_EXIST_ERROR: {
      return {
        ...state,
        patientExist: false,
      };
    }
    case PatientsActionEnum.AFTER_DOES_PATIENT_EXIST: {
      return {
        ...state,
        existingPatient: null,
        patientExist: false,
      };
    }
    case PatientsActionEnum.ADD_NEW_PATIENT_NEW_API: {
      return {
        ...state,
        newPatientAdded: true,
      };
    }
    default:
      return state;
  }
};
