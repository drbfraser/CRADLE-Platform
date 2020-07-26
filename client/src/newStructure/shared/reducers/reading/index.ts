import { NewReading, OrNull, Patient, ServerError, UrineTests } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';

enum ReadingEnum {
  CREATE_READING_REQUESTED = `reading/CREATE_READING_REQUESTED`,
  CREATE_READING_SUCCESS = `reading/CREATE_READING_SUCCESS`,
  CREATE_READING_ERROR = `reading/CREATE_READING_ERROR`,
  CLEAR_CREATE_READING_OUTCOME = `reading/CLEAR_CREATE_NEW_READING_OUTCOME`,
}

type ReadingPayload = { message: string };

type ReadingAction =
  | { type: ReadingEnum.CREATE_READING_REQUESTED }
  | { type: ReadingEnum.CREATE_READING_ERROR; payload: { error: ServerError } }
  | { type: ReadingEnum.CLEAR_CREATE_READING_OUTCOME }
  | {
      type: ReadingEnum.CREATE_READING_SUCCESS;
      payload: ReadingPayload;
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
    symptoms: string;
    dateRecheckVitalsNeeded: null;
    urineTests: OrNull<Record<keyof UrineTests, string>>;
  };
};

const createReadingRequested = (): ReadingAction => ({
  type: ReadingEnum.CREATE_READING_REQUESTED,
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
        onSuccess: (message: string): ReadingAction => {
          console.log(message);
          return {
            type: ReadingEnum.CREATE_READING_SUCCESS,
            payload: { message },
          };
        },
        onError: (error: ServerError): ReadingAction => ({
          type: ReadingEnum.CREATE_READING_ERROR,
          payload: { error },
        }),
      })
    );
  };
};

export const clearCreateReadingOutcome = (): ReadingAction => ({
  type: ReadingEnum.CLEAR_CREATE_READING_OUTCOME,
});

export type ReadingState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  readingCreated: boolean;
};

const initialState: ReadingState = {
  error: false,
  loading: false,
  message: null,
  readingCreated: false,
};

export const readingReducer = (
  state = initialState,
  action: ReadingAction
): ReadingState => {
  switch (action.type) {
    case ReadingEnum.CREATE_READING_REQUESTED:
      return {
        ...initialState,
        loading: true,
      };
    case ReadingEnum.CREATE_READING_SUCCESS:
      return {
        ...initialState,
        message: action.payload.message,
        readingCreated: true,
      };
    case ReadingEnum.CREATE_READING_ERROR:
      return {
        ...initialState,
        error: true,
        message: action.payload.error.message,
        readingCreated: false,
      };
    case ReadingEnum.CLEAR_CREATE_READING_OUTCOME:
      return initialState;
    default:
      return state;
  }
};
