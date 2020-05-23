import { Endpoints } from '../../../../server/endpoints';
import { INVALID_USER } from '../serverLoginErrorMessage';
import { Methods } from '../../../../server/methods';
import { push } from 'connected-react-router';
import { serverRequestActionCreator } from '../../utils';

const USER_LOGIN_SUCCESS = `user/USER_LOGIN_SUCCESS`;
const LOGIN_USER = `user/LOGIN_USER`;
export const LOGOUT_USER = `user/LOGOUT_USER`;

export const logoutUserAction = () => ({
  type: LOGOUT_USER,
});

export const logoutUser = () => {
  return (dispatch: any) => {
    localStorage.removeItem('token');
    dispatch(logoutUserAction());
    dispatch(push('/login'));
  };
};

export const userLoginFetch = (data: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.AUTH}`,
    method: Methods.POST,
    data,
    onSuccess: (response: any) => ({
      type: USER_LOGIN_SUCCESS,
      payload: response,
    }),
    onError: (message: any) => ({
      type: INVALID_USER,
      payload: message,
    }),
  });
};

export const getCurrentUser = () => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.CURRENT}`,
    onSuccess: (response: any) => ({
      type: LOGIN_USER,
      payload: response,
    }),
    onError: () => (dispatch: any) => {
      localStorage.removeItem(`token`);
      dispatch(logoutUserAction());
      dispatch(push(`/login`));
    },
  });
};

const initialState = {
  currentUser: {},
};

export const currentUserReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case LOGIN_USER:
      return action.payload.data;
    case LOGOUT_USER:
      return { isLoggedIn: false };
    case USER_LOGIN_SUCCESS:
      localStorage.setItem(`token`, action.payload.data.token);
      localStorage.setItem(`refresh`, action.payload.data.refresh);
      const user = action.payload.data;
      return {
        ...state,
        ...{
          email: user.email,
          roles: user.roles,
          firstName: user.firstName,
          healthFacilityName: user.healthFacilityName,
          userId: user.userId,
          vhtList: user.vhtList,
        },
        isLoggedIn: true,
      };
    default:
      return state;
  }
};
