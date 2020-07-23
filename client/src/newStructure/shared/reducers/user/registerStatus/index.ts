import { OrNull, User } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../../utils';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';

enum RegisterStatusEnum {
  CLEAR_REQUEST_OUTCOME = 'registerStatus/CLEAR_REQUEST_OUTCOME',
  REGISTER_USER_REQUESTED = 'registerStatus/REGISTER_USER_REQUESTED',
  REGISTER_USER_SUCCESS = 'registerStatus/REGISTER_USER_SUCCESS',
  REGISTER_USER_ERROR = 'registerStatus/REGISTER_USER_ERROR',
}

export type RegisterStatusAction =
  | { type: RegisterStatusEnum.CLEAR_REQUEST_OUTCOME }
  | { type: RegisterStatusEnum.REGISTER_USER_REQUESTED }
  | {
      type: RegisterStatusEnum.REGISTER_USER_SUCCESS;
      payload: { message: string };
    }
  | {
      type: RegisterStatusEnum.REGISTER_USER_ERROR;
      payload: { message: string };
    };

const clearRegisterStatusOutcome = (): RegisterStatusAction => ({
  type: RegisterStatusEnum.CLEAR_REQUEST_OUTCOME,
});

const registerUserRequested = (): RegisterStatusAction => ({
  type: RegisterStatusEnum.REGISTER_USER_REQUESTED,
});

export const registerUser = (
  data: User
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(registerUserRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.USER}${Endpoints.REGISTER}`,
        method: Methods.POST,
        data,
        onSuccess: (): RegisterStatusAction => {
          setTimeout(() => {
            dispatch(clearRegisterStatusOutcome());
          }, 3000);

          return {
            type: RegisterStatusEnum.REGISTER_USER_SUCCESS,
            payload: { message: `User successfully created!` },
          };
        },
        onError: (message: string): RegisterStatusAction => ({
          type: RegisterStatusEnum.REGISTER_USER_ERROR,
          payload: { message },
        }),
      })
    );
  };
};

export type RegisterStatusState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  userCreated: boolean;
};

const initialState: RegisterStatusState = {
  error: false,
  loading: false,
  message: null,
  userCreated: false,
};

export const registerStatusReducer = (
  state = initialState,
  action: RegisterStatusAction
): RegisterStatusState => {
  switch (action.type) {
    case RegisterStatusEnum.CLEAR_REQUEST_OUTCOME: {
      return initialState;
    }
    case RegisterStatusEnum.REGISTER_USER_REQUESTED: {
      return {
        ...initialState,
        loading: false,
      };
    }
    case RegisterStatusEnum.REGISTER_USER_SUCCESS: {
      return {
        ...initialState,
        message: action.payload.message,
        userCreated: true,
      };
    }
    case RegisterStatusEnum.REGISTER_USER_ERROR: {
      return {
        ...initialState,
        error: true,
        message: action.payload.message,
      };
    }
    default: {
      return state;
    }
  }
};
