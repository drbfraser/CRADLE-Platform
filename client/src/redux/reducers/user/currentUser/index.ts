import {
  IUserWithTokens,
  Callback,
  OrNull,
  ServerError,
} from 'src/shared/types';
import { ServerRequestAction, serverRequestActionCreator } from '../../utils';

import { Dispatch } from 'redux';
import { EndpointEnum, MethodEnum } from 'src/shared/enums';
import { RootState } from 'src/redux/store';
import { NavigateFunction } from 'react-router-dom';

export enum CurrentUserActionEnum {
  CLEAR_CURRENT_USER_ERROR = 'currentUser/CLEAR_CURRENT_USER_ERROR',
  GET_CURRENT_USER_REQUESTED = 'currentUser/GET_CURRENT_USER_REQUESTED',
  GET_CURRENT_USER_SUCCESS = 'currentUser/GET_CURRENT_USER_SUCCESS',
  GET_CURRENT_USER_ERROR = 'currentUser/GET_CURRENT_USER_ERROR',
  LOGIN_USER_REQUESTED = 'currentUser/LOGIN_USER_REQUESTED',
  LOGIN_USER_SUCCESS = 'currentUser/LOGIN_USER_SUCCESS',
  LOGIN_USER_ERROR = 'currentUser/LOGIN_USER_ERROR',
  LOGOUT_USER = 'currentUser/LOGOUT_USER',
}

export const clearCurrentUserError = (): CurrentUserAction => ({
  type: CurrentUserActionEnum.CLEAR_CURRENT_USER_ERROR,
});

type CurrentUserAction =
  | { type: CurrentUserActionEnum.CLEAR_CURRENT_USER_ERROR }
  | { type: CurrentUserActionEnum.GET_CURRENT_USER_REQUESTED }
  | {
      type: CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS;
      payload: { currentUser: IUserWithTokens };
    }
  | {
      type: CurrentUserActionEnum.GET_CURRENT_USER_ERROR;
      payload: { message: string };
    }
  | { type: CurrentUserActionEnum.LOGIN_USER_REQUESTED }
  | {
      type: CurrentUserActionEnum.LOGIN_USER_SUCCESS;
      payload: { user: IUserWithTokens };
    }
  | {
      type: CurrentUserActionEnum.LOGIN_USER_ERROR;
      payload: { message: string };
    }
  | { type: CurrentUserActionEnum.LOGOUT_USER };

export const logoutUser = (): Callback<Dispatch> => {
  return (dispatch: Dispatch): void => {
    localStorage.removeItem('accessToken');
    dispatch({ type: CurrentUserActionEnum.LOGOUT_USER });
  };
};

export type LoginData = {
  username: string;
  password: string;
};

const loginUserRequested = (): CurrentUserAction => ({
  type: CurrentUserActionEnum.LOGIN_USER_REQUESTED,
});

export const loginUser = (
  data: LoginData,
  navigate: NavigateFunction
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(clearCurrentUserError());
    dispatch(loginUserRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: EndpointEnum.AUTH,
        method: MethodEnum.POST,
        data,
        onSuccess: ({ data }: { data: IUserWithTokens }): CurrentUserAction => {
          console.log('Login Success - Response Data: ', data);
          // Store access token in local storage.
          localStorage.setItem(`accessToken`, data.accessToken);
          navigate('/referrals');
          return {
            type: CurrentUserActionEnum.LOGIN_USER_SUCCESS,
            payload: { user: data },
          };
        },
        onError: ({ message }: ServerError) => {
          return {
            type: CurrentUserActionEnum.LOGIN_USER_ERROR,
            payload: { message },
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
  dispatch: Dispatch<any>
) => ServerRequestAction) => {
  return (dispatch: Dispatch<any>) => {
    dispatch(getCurrentUserRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: EndpointEnum.USER_CURRENT,
        onSuccess: ({
          data: currentUser,
        }: {
          data: IUserWithTokens;
        }): CurrentUserAction => ({
          type: CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS,
          payload: { currentUser },
        }),
        onError: ({ message }: ServerError): CurrentUserAction => {
          dispatch(logoutUser());
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
  data: OrNull<IUserWithTokens>;
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
    case CurrentUserActionEnum.CLEAR_CURRENT_USER_ERROR: {
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

export const selectLoggedIn = (state: RootState) => {
  return Boolean(state?.user.current.loggedIn);
};
export const selectCurrentUser = (state: RootState) => {
  return state?.user.current;
};
