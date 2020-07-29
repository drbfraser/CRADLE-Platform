import {
  NewReading,
  OrNull,
  OrUndefined,
  Patient,
  Reading,
  ServerError,
  UrineTests,
} from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';

enum ReadingActionEnum {
  CREATE_READING_REQUESTED = `reading/CREATE_READING_REQUESTED`,
  CREATE_READING_SUCCESS = `reading/CREATE_READING_SUCCESS`,
  CREATE_READING_ERROR = `reading/CREATE_READING_ERROR`,
  CLEAR_CREATE_READING_OUTCOME = `reading/CLEAR_CREATE_READING_OUTCOME`,
  CLEAR_READING_CREATED_RESPONSE = `reading/CLEAR_READING_CREATED_RESPONSE`,
}

export type ReadingCreatedResponse = {
  patient: Patient;
  reading: Reading;
};

type CreateReadingSuccessPayload = {
  message: string;
  patient: Patient;
  reading: Reading;
};

type ReadingAction =
  | { type: ReadingActionEnum.CREATE_READING_REQUESTED }
  | {
      type: ReadingActionEnum.CREATE_READING_ERROR;
      payload: { error: ServerError };
    }
  | { type: ReadingActionEnum.CLEAR_CREATE_READING_OUTCOME }
  | { type: ReadingActionEnum.CLEAR_READING_CREATED_RESPONSE }
  | {
      type: ReadingActionEnum.CREATE_READING_SUCCESS;
      payload: CreateReadingSuccessPayload;
    };

type CreateReading = {
  patient: Omit<Patient, 'readings' | 'needsAssessment' | 'tableData'>;
  reading: Omit<
    NewReading,
    'dateTimeTaken' | 'dateRecheckVitalsNeeded' | 'urineTests'
  > & {
    userId: number;
    readingId: string;
    dateTimeTaken: number;
    symptoms: Array<string>;
    dateRecheckVitalsNeeded: null;
    urineTests: OrUndefined<Record<keyof UrineTests, string>>;
  };
};

const createReadingRequested = (): ReadingAction => ({
  type: ReadingActionEnum.CREATE_READING_REQUESTED,
});

export const createReading = (
  data: CreateReading
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(createReadingRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.PATIENT}${Endpoints.READING}`,
        method: Methods.POST,
        data,
        onSuccess: ({
          data,
        }: {
          data: CreateReadingSuccessPayload;
        }): ReadingAction => {
          return {
            type: ReadingActionEnum.CREATE_READING_SUCCESS,
            payload: data,
          };
        },
        onError: (error: ServerError): ReadingAction => ({
          type: ReadingActionEnum.CREATE_READING_ERROR,
          payload: { error },
        }),
      })
    );
  };
};

export const clearCreateReadingOutcome = (): ReadingAction => ({
  type: ReadingActionEnum.CLEAR_CREATE_READING_OUTCOME,
});

export const clearReadingCreatedResponse = (): ReadingAction => ({
  type: ReadingActionEnum.CLEAR_READING_CREATED_RESPONSE,
});

export type ReadingState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  readingCreated: boolean;
  readingCreatedResponse: OrNull<ReadingCreatedResponse>;
};

const initialState: ReadingState = {
  error: false,
  loading: false,
  message: null,
  readingCreated: false,
  readingCreatedResponse: null,
};

export const readingReducer = (
  state = initialState,
  action: ReadingAction
): ReadingState => {
  switch (action.type) {
    case ReadingActionEnum.CREATE_READING_REQUESTED:
      return {
        ...initialState,
        loading: true,
      };
    case ReadingActionEnum.CREATE_READING_SUCCESS:
      return {
        ...initialState,
        message: action.payload.message,
        readingCreated: true,
        readingCreatedResponse: {
          patient: action.payload.patient,
          reading: action.payload.reading,
        },
      };
    case ReadingActionEnum.CREATE_READING_ERROR:
      return {
        ...initialState,
        error: true,
        message: action.payload.error.message,
        readingCreated: false,
      };
    case ReadingActionEnum.CLEAR_CREATE_READING_OUTCOME:
      return initialState;
    case ReadingActionEnum.CLEAR_READING_CREATED_RESPONSE:
      return { ...state, readingCreatedResponse: null };
    default:
      return state;
  }
};
