import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { OrNull } from '@types';
enum NewReadingStatusEnum {
  CLEAR_REQUEST_OUTCOME = `newReadingStatus/CLEAR_REQUEST_OUTCOME`,
  NEW_READING_STATUS_ERROR = `newReadingStatus/NEW_READING_STATUS_ERROR`,
  NEW_READING_STATUS_SUCCESS = `newReadingStatus/NEW_READING_STATUS_SUCCESS`,
}
type NewReadingStatusPayload = { message: string };
type NewReadingStatusAction =
  | { type: NewReadingStatusEnum.NEW_READING_STATUS_ERROR }
  | { type: NewReadingStatusEnum.CLEAR_REQUEST_OUTCOME }
  | {
      type: NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS;
      payload: NewReadingStatusPayload;
    };
export const addNewReading = (data: any): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}${Endpoints.READING}`,
    method: Methods.POST,
    data,
    onSuccess: (message: string): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS,
      payload: { message },
    }),
    onError: (): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_ERROR,
    }),
  });
};

export const addReadingNew = (reading: any) => {
  return serverRequestActionCreator({
    endpoint: `/readings`,
    method: Methods.POST,
    data: reading,
    onSuccess: (message: string): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS,
      payload: { message },
    }),
    onError: (): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_ERROR,
    }),
  });
};

export const addReadingAssessment = (assessment: any) => {
  return serverRequestActionCreator({
    endpoint: `/assessments`,
    method: Methods.POST,
    data: assessment,
    onSuccess: (message: string): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS,
      payload: { message },
    }),
    onError: (): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_ERROR,
    }),
  });
};

export const resetNewReadingStatus = (): NewReadingStatusAction => ({
  type: NewReadingStatusEnum.CLEAR_REQUEST_OUTCOME,
});
export type NewReadingStatusState = {
  error: boolean;
  message: OrNull<string>;
  readingCreated: boolean;
};
const initialState: NewReadingStatusState = {
  error: false,
  message: null,
  readingCreated: false,
};
export const newReadingStatusReducer = (
  state = initialState,
  action: NewReadingStatusAction
): NewReadingStatusState => {
  switch (action.type) {
    case NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS:
      return {
        ...initialState,
        message: action.payload.message,
        readingCreated: true,
      };
    case NewReadingStatusEnum.NEW_READING_STATUS_ERROR:
      return {
        error: true,
        message: `Error! Patient reading not created.`,
        readingCreated: false,
      };
    case NewReadingStatusEnum.CLEAR_REQUEST_OUTCOME:
      return initialState;
    default:
      return state;
  }
};
