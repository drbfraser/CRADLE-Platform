import { SecretKey, ServerError } from 'src/shared/types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { Dispatch } from 'redux';
import { EndpointEnum, MethodEnum } from 'src/shared/enums';

export enum SecretKeyActionEnum {
  GET_SECRETKEY = 'secretKey/GET_SECRETKEY',
  GET_SECRETKEY_ERROR = 'secretKey/GET_SECRETKEY_ERROR',
  UPDATE_SECRETKEY = 'secretKey/UPDATE_SECRETKEY',
  UPDATE_SECRETKEY_ERROR = 'secretKey/UPDATE_SECRETKEY_ERROR',
  REPLACE_SECRETKEY = 'secretKey/REPLACE_SECRETKEY',
}

type ErrorPayload = {
  message: string;
};

type SecretKeyAction =
  | {
      type: SecretKeyActionEnum.GET_SECRETKEY;
      payload: { data: SecretKey };
    }
  | {
      type: SecretKeyActionEnum.GET_SECRETKEY_ERROR;
      payload: ErrorPayload;
    }
  | {
      type: SecretKeyActionEnum.UPDATE_SECRETKEY;
      payload: { data: SecretKey };
    }
  | {
      type: SecretKeyActionEnum.UPDATE_SECRETKEY_ERROR;
      payload: ErrorPayload;
    }
  | {
      type: SecretKeyActionEnum.REPLACE_SECRETKEY;
      payload: { data: SecretKey };
    };

export const getSecretKey = (
  userId: number
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    return dispatch(
      serverRequestActionCreator({
        endpoint: `/user/${userId}` + EndpointEnum.SECRETKEY,
        onSuccess: ({ data }: { data: SecretKey }): SecretKeyAction => ({
          type: SecretKeyActionEnum.GET_SECRETKEY,
          payload: { data: data },
        }),
        onError: ({ message }: ServerError): SecretKeyAction => {
          return {
            type: SecretKeyActionEnum.GET_SECRETKEY_ERROR,
            payload: { message },
          };
        },
      })
    );
  };
};

export const updateSecretKey = (
  userId: number
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    return dispatch(
      serverRequestActionCreator({
        endpoint: `/user/${userId}` + EndpointEnum.SECRETKEY,
        method: MethodEnum.PUT,
        onSuccess: ({ data }: { data: SecretKey }): SecretKeyAction => ({
          type: SecretKeyActionEnum.UPDATE_SECRETKEY,
          payload: { data: data },
        }),
        onError: ({ message }: ServerError): SecretKeyAction => {
          return {
            type: SecretKeyActionEnum.UPDATE_SECRETKEY_ERROR,
            payload: { message },
          };
        },
      })
    );
  };
};

export const replaceSecretKey = (data: SecretKey) => ({
  type: SecretKeyActionEnum.REPLACE_SECRETKEY,
  payload: { data },
});

export type SecretKeyState = {
  data?: SecretKey;
  error?: string;
};

const initialState: SecretKeyState = {
  data: undefined,
  error: undefined,
};

export const secretKeyReducer = (
  state = initialState,
  action: SecretKeyAction
): SecretKeyState => {
  switch (action.type) {
    case SecretKeyActionEnum.GET_SECRETKEY:
    case SecretKeyActionEnum.UPDATE_SECRETKEY:
      return {
        ...state,
        data: action.payload.data,
      };
    case SecretKeyActionEnum.GET_SECRETKEY_ERROR:
    case SecretKeyActionEnum.UPDATE_SECRETKEY_ERROR:
      return {
        ...state,
        error: action.payload.message,
      };
    case SecretKeyActionEnum.REPLACE_SECRETKEY:
      return {
        ...state,
        data: action.payload.data,
      };
    default:
      return state;
  }
};
