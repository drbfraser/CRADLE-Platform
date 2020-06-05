import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';

enum NewReadingPostActionsEnum {
  CREATE_READING_SUCCESS = 'CREATE_READING_SUCCESS',
  CREATE_READING_ERROR = 'CREATE_READING_ERROR',
  CREATE_READING_DEFAULT = 'CREATE_READING_DEFAULT',
}

export const newReadingPost = (reading: any): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: Endpoints.PATIENT + Endpoints.READING,
    onSuccess: (response) => ({
      type: NewReadingPostActionsEnum.CREATE_READING_SUCCESS,
      payload: response,
    }),
    onError: (error) => ({
      type: NewReadingPostActionsEnum.CREATE_READING_ERROR,
      payload: error,
    }),
    data: reading,
    method: Methods.POST,
  });
};

export const createReadingDefault = () => ({
  type: NewReadingPostActionsEnum.CREATE_READING_DEFAULT,
});
