import { Endpoints } from '@server-endpoints';
import { Methods } from '@server-methods';
import { serverRequestActionCreator, ServerRequestAction } from '../utils';
import { OrNull } from '@types';

enum NewReadingStatusEnum {
  NEW_READING_STATUS_ERROR = `newReadingStatus/NEW_READING_STATUS_ERROR`,
  NEW_READING_STATUS_RESET = `newReadingStatus/NEW_READING_STATUS_RESET`,
  NEW_READING_STATUS_SUCCESS = `newReadingStatus/NEW_READING_STATUS_SUCCESS`,
}

type NewReadingStatusPayload = { message: string };

type NewReadingStatusAction = 
 | { type: NewReadingStatusEnum.NEW_READING_STATUS_ERROR, payload: NewReadingStatusPayload } 
 | { type: NewReadingStatusEnum.NEW_READING_STATUS_RESET }
 | { type: NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS, payload: NewReadingStatusPayload };

export const addNewReading = (data: any): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}${Endpoints.READING}`,
    method: Methods.POST,
    data,
    onSuccess: (message: string): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS,
      payload: { message },
    }),
    onError: (message: string): NewReadingStatusAction => ({
      type: NewReadingStatusEnum.NEW_READING_STATUS_ERROR,
      payload: { message },
    }),
  });
};

export const resetNewReadingStatus = (): NewReadingStatusAction => ({
  type: NewReadingStatusEnum.NEW_READING_STATUS_RESET,
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

export const newReadingStatusReducer = (state = initialState, action: NewReadingStatusAction) => {
  switch (action.type) {
    case NewReadingStatusEnum.NEW_READING_STATUS_SUCCESS:
      return {
        message: action.payload.message,
        error: false,
        readingCreated: true,
      };

    case NewReadingStatusEnum.NEW_READING_STATUS_ERROR:
      return {
        message: `Error! Patient reading not created.`,
        error: true,
        readingCreated: false,
      };

    case NewReadingStatusEnum.NEW_READING_STATUS_RESET:
    default:
      return state;
  }
};