import { Callback, OrNull, ServerError, User } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../../utils';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';
import { push } from 'connected-react-router';

export enum CurrentUserActionEnum {
  CLEAR_REQUEST_OUTCOME = 'currentUser/CLEAR_REQUEST_OUTCOME',
  GET_CURRENT_USER_REQUESTED = 'currentUser/GET_CURRENT_USER_REQUESTED',
  GET_CURRENT_USER_SUCCESS = 'currentUser/GET_CURRENT_USER_SUCCESS',
  GET_CURRENT_USER_ERROR = 'currentUser/GET_CURRENT_USER_ERROR',
  LOGIN_USER_REQUESTED = 'currentUser/LOGIN_USER_REQUESTED',
  LOGIN_USER_SUCCESS = 'currentUser/LOGIN_USER_SUCCESS',
  LOGIN_USER_ERROR = 'currentUser/LOGIN_USER_ERROR',
  LOGOUT_USER = 'currentUser/LOGOUT_USER',
}

type CurrentUserAction =
  | { type: CurrentUserActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: CurrentUserActionEnum.GET_CURRENT_USER_REQUESTED }
  | {
      type: CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS;
      payload: { currentUser: User };
    }
  | {
      type: CurrentUserActionEnum.GET_CURRENT_USER_ERROR;
      payload: { message: string };
    }
  | { type: CurrentUserActionEnum.LOGIN_USER_REQUESTED }
  | { type: CurrentUserActionEnum.LOGIN_USER_SUCCESS; payload: { user: User } }
  | {
      type: CurrentUserActionEnum.LOGIN_USER_ERROR;
      payload: { message: string };
    }
  | { type: CurrentUserActionEnum.LOGOUT_USER };

export const logoutUser = (): Callback<Dispatch> => {
  return (dispatch: Dispatch): void => {
    localStorage.removeItem('token');
    dispatch({ type: CurrentUserActionEnum.LOGOUT_USER });
    dispatch(push('/login'));
  };
};

export type LoginData = {
  email: string;
  password: string;
};

const loginUserRequested = (): CurrentUserAction => ({
  type: CurrentUserActionEnum.LOGIN_USER_REQUESTED,
});

export const loginUser = (
  data: LoginData
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(loginUserRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.USER}${Endpoints.AUTH}`,
        method: Methods.POST,
        data,
        onSuccess: ({ data }: { data: User }): CurrentUserAction => {
          localStorage.setItem(`token`, data.token);
          localStorage.setItem(`refresh`, data.refresh);
          return {
            type: CurrentUserActionEnum.LOGIN_USER_SUCCESS,
            payload: { user: data },
          };
        },
        onError: (error: ServerError) => {
          console.error(error);
          return {
            type: CurrentUserActionEnum.LOGIN_USER_ERROR,
            payload: { message: error.message },
          };
        },
      })
    );
  };
};

const getCurrentUserRequested = (): CurrentUserAction => ({
  type: CurrentUserActionEnum.GET_CURRENT_USER_REQUESTED,
});

export const getCurrentUser = (): ((
  dispatch: Dispatch
) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(getCurrentUserRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.USER}${Endpoints.CURRENT}`,
        onSuccess: ({
          data: currentUser,
        }: {
          data: User;
        }): CurrentUserAction => ({
          type: CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS,
          payload: { currentUser },
        }),
        onError: (message: string): CurrentUserAction => {
          logoutUser();
          return {
            type: CurrentUserActionEnum.GET_CURRENT_USER_ERROR,
            payload: { message },
          };
        },
      })
    );
  };
};

export type CurrentUserState = {
  data: OrNull<User>;
  error: boolean;
  loading: boolean;
  loggedIn: boolean;
  message: OrNull<string>;
};

const initialState: CurrentUserState = {
  data: null,
  error: false,
  loading: false,
  loggedIn: false,
  message: null,
};

export const currentUserReducer = (
  state = initialState,
  action: CurrentUserAction
): CurrentUserState => {
  switch (action.type) {
    case CurrentUserActionEnum.CLEAR_REQUEST_OUTCOME: {
      return {
        ...initialState,
        data: state.data,
      };
    }
    case CurrentUserActionEnum.LOGIN_USER_REQUESTED:
    case CurrentUserActionEnum.GET_CURRENT_USER_REQUESTED: {
      return { ...initialState, loading: true };
    }
    case CurrentUserActionEnum.LOGIN_USER_ERROR:
    case CurrentUserActionEnum.GET_CURRENT_USER_ERROR: {
      return {
        ...initialState,
        error: true,
        message: action.payload.message,
      };
    }
    case CurrentUserActionEnum.LOGIN_USER_SUCCESS: {
      return { ...initialState, data: action.payload.user, loggedIn: true };
    }
    case CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS: {
      return {
        ...initialState,
        data: action.payload.currentUser,
        loggedIn: true,
      };
    }
    default:
      return state;
  }
};
