import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { serverRequestActionCreator } from '../utils';

const NEW_READING_DEFAULT = `newReadingStatus/NEW_READING_DEFAULT`;
const NEW_READING_SUCCESS = `newReadingStatus/NEW_READING_SUCCESS`;
const NEW_READING_ERROR = `newReadingStatus/NEW_READING_ERROR`;

export const newReadingPost = (data: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.PATIENT}${Endpoints.READING}`,
    method: Methods.POST,
    data,
    onSuccess: (response: any) => ({
      type: NEW_READING_SUCCESS,
      payload: response,
    }),
    onError: (error: any) => ({
      type: NEW_READING_ERROR,
      payload: error,
    }),
  });
};

export const createReadingDefault = () => ({
  type: NEW_READING_DEFAULT,
});


export const newReadingStatusReducer = (_: any, action: any) => {
  switch (action.type) {
    case NEW_READING_SUCCESS:
      return {
        message: action.payload.data,
        error: false,
        readingCreated: true,
      };

    case NEW_READING_ERROR:
      return {
        message: `Error! Patient reading not created.`,
        error: true,
        readingCreated: false,
      };

    case NEW_READING_DEFAULT:
    default:
      return {
        error: false,
        readingCreated: false,
      };
  }
};