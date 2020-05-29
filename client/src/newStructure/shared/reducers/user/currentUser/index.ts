import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';
import { push, RouterAction } from 'connected-react-router';
import { serverRequestActionCreator, ServerRequestAction } from '../../utils';
import { Callback, User, OrNull } from '@types';

export enum CurrentUserActionEnum {
  CLEAR_REQUEST_OUTCOME = 'currentUser/CLEAR_REQUEST_OUTCOME',
  GET_CURRENT_USER_ERROR = 'currentUser/GET_CURRENT_USER_ERROR',
  GET_CURRENT_USER_SUCCESS = 'currentUser/GET_CURRENT_USER_SUCCESS',
  LOGIN_USER_ERROR = 'currentUser/LOGIN_USER_ERROR',
  LOGIN_USER_SUCCESS = 'currentUser/LOGIN_USER_SUCCESS',
  LOGOUT_USER = 'currentUser/LOGOUT_USER',
  START_REQUEST = 'currentUser/START_REQUEST',
}

type CurrentUserAction = 
  | { type: CurrentUserActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: CurrentUserActionEnum.GET_CURRENT_USER_ERROR, payload: { message: string } }
  | { type: CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS, payload: { currentUser: User } }
  | { type: CurrentUserActionEnum.LOGIN_USER_ERROR, payload: { message: string } }
  | { type: CurrentUserActionEnum.LOGIN_USER_SUCCESS, payload: { user: User } }
  | { type: CurrentUserActionEnum.LOGOUT_USER }
  | { type: CurrentUserActionEnum.START_REQUEST };

export const logoutUser = (): Callback<Callback<CurrentUserAction |  RouterAction>> => {
  return (dispatch: Callback<CurrentUserAction |  RouterAction>): void => {
    localStorage.removeItem('token');
    dispatch({ type: CurrentUserActionEnum.LOGOUT_USER });
    dispatch(push('/login'));
  };
};

export const startRequest = (): CurrentUserAction => ({
  type: CurrentUserActionEnum.START_REQUEST
});

export type CurrentUserRequest = Callback<Callback<CurrentUserAction | RouterAction>, ServerRequestAction>;

export type LoginData = {
  email: string;
  password: string;
}

export const login = (data: LoginData): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.AUTH}`,
    method: Methods.POST,
    data,
    onSuccess: ({ data }: { data: User }): CurrentUserAction => {
      localStorage.setItem(`token`, data.token)
      localStorage.setItem(`refresh`, data.refresh)
      return {
        type: CurrentUserActionEnum.LOGIN_USER_SUCCESS,
        payload: { user: data },
      }
    },
    onError: (message: string) => ({
      type: CurrentUserActionEnum.LOGIN_USER_ERROR,
      payload: { message },
    }),
  });
};

export const getCurrentUser = (): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.CURRENT}`,
    onSuccess: (currentUser: User): CurrentUserAction => ({
      type: CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS,
      payload: { currentUser },
    }),
    onError: (message: string): CurrentUserAction => {
      logoutUser();
      return {
        type: CurrentUserActionEnum.GET_CURRENT_USER_ERROR,
        payload: { message },
      }
    },
  });
};

export type CurrentUserState = {
  data: OrNull<User>;
  error: boolean;
  loading: boolean,
  loggedIn: boolean,
  message: OrNull<string>;
}

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
    case CurrentUserActionEnum.CLEAR_REQUEST_OUTCOME:
      return { 
        ...initialState, 
        data: state.data, 
      };
    case CurrentUserActionEnum.GET_CURRENT_USER_ERROR:
    case CurrentUserActionEnum.LOGIN_USER_ERROR:
      return { 
        ...initialState, 
        error: true, 
        message: action.payload.message, 
      };
    case CurrentUserActionEnum.GET_CURRENT_USER_SUCCESS:
      return { 
        ...initialState, 
        data: action.payload.currentUser, 
      };
    case CurrentUserActionEnum.LOGIN_USER_SUCCESS:
      return { ...initialState, data: action.payload.user, loggedIn: true };
    case CurrentUserActionEnum.START_REQUEST:
      return { ...initialState, loading: true };
    default:
      return state;
  }
};
