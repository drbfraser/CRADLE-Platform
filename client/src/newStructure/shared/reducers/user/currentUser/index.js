import { Endpoints } from '../../../../server/endpoints';
import { INVALID_USER } from '../serverLoginErrorMessage';
import { Methods } from '../../../../server/methods';
import { getUserFromResponse } from '../../../utils';
import { push } from 'connected-react-router';

const USER_LOGIN_SUCCESS = `user/USER_LOGIN_SUCCESS`;
const LOGIN_USER = `user/LOGIN_USER`;
export const LOGOUT_USER = `user/LOGOUT_USER`;

export const logoutUserAction = () => ({
  type: LOGOUT_USER,
});

export const userLoginFetch = (data) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.AUTH}`,
    method: Methods.POST,
    data,
    onSuccess: (response) => ({
      type: USER_LOGIN_SUCCESS,
      payload: response,
    }),
    onError: (message) => ({
      type: INVALID_USER,
      payload: message,
    }),
  });
};

export const getCurrentUser = () => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.CURRENT}`,
    onSuccess: (response) => ({
      type: LOGIN_USER,
      payload: response,
    }),
    onError: () => (dispatch) => {
      localStorage.removeItem(`token`);
      dispatch(logoutUserAction());
      dispatch(push(`/login`));
    },
  });
};

const initialState = {
  currentUser: {},
};

export const currentUserReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_USER:
      return action.payload.data;
    case LOGOUT_USER:
      return { isLoggedIn: false };
    case USER_LOGIN_SUCCESS:
      localStorage.setItem(`token`, action.payload.data.token);
      localStorage.setItem(`refresh`, action.payload.data.refresh);
      return {
        ...state,
        ...getUserFromResponse(action.payload.data),
        isLoggedIn: true,
      };
    default:
      return state;
  }
};
