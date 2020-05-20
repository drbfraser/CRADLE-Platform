import { Endpoint, Method } from '../../../api/constants';

import { combineReducers } from 'redux';
import { getUserFromResponse } from '../../utils';
import { push } from 'connected-react-router';
import { requestActionCreator } from '../../../actions/api';

const GET_USERS_SUCCESS = `user/GET_USERS_SUCCESS`;
const GET_USERS_REQ = `user/GET_USERS_REQ`;
const GET_USERS_ERR = `user/GET_USERS_ERR`;

const GET_VHTS_SUCCESS = `user/GET_VHTS_SUCCESS`;
const GET_VHTS_REQ = `user/GET_VHTS_REQ`;
const GET_VHTS_ERR = `user/GET_VHTS_ERR`;

const UPDATE_USERS_SUCCESS = `user/UPDATE_USERS_SUCCESS`;
const UPDATE_USERS_REQ = `user/UPDATE_USERS_REQ`;
const UPDATE_USERS_ERR = `user/UPDATE_USERS_ERR`;

const DELETE_USERS_SUCCESS = `user/DELETE_USERS_SUCCESS`;
const DELETE_USERS_REQ = `user/DELETE_USERS_REQ`;
const DELETE_USERS_ERR = `user/DELETE_USERS_ERR`;

const USER_LOGIN_SUCCESS = `user/USER_LOGIN_SUCCESS`;
const REGISTER_USER_DEFAULT = `user/REGISTER_USER_DEFAULT`;

const LOGIN_USER = `user/LOGIN_USER`;
export const LOGOUT_USER = `user/LOGOUT_USER`;

export const registerUser = (user) => {
  return requestActionCreator(
    `${Endpoint.USER}${Endpoint.REGISTER}`,
    Method.POST,
    user,
    () => ({
      type: `REGISTER_SUCCESS`,
    }),
    (message) => ({
      type: `REGISTER_ERROR`,
      payload: message,
    })
  );
};

export const userLoginFetch = (user) => {
  return requestActionCreator(
    `${Endpoint.USER}${Endpoint.AUTH}`,
    Method.POST,
    user,
    (response) => ({
      type: USER_LOGIN_SUCCESS,
      payload: response,
    }),
    (message) => ({
      type: `INVALID_USER`,
      payload: message,
    })
  );
};

export const getCurrentUser = () => {
  return requestActionCreator(
    `${Endpoint.USER}${Endpoint.CURRENT}`,
    Method.GET,
    null,
    (response) => ({
      type: `LOGIN_USER`,
      payload: response,
    }),
    () => (dispatch) => {
      localStorage.removeItem(`token`);
      dispatch(logoutUserAction());
      dispatch(push(`/login`));
    }
  );
};

export const getUsers = () => {
  return requestActionCreator(
    `${Endpoint.USER}${Endpoint.ALL}`,
    Method.GET,
    null,
    (response) => ({
      type: GET_USERS_SUCCESS,
      payload: response,
    }),
    (error) => ({
      type: GET_USERS_ERR,
      payload: error,
    })
  );
};

export const getVhtList = () => {
  return requestActionCreator(
    `${Endpoint.USER}${Endpoint.VHTS}`,
    Method.GET,
    null,
    (response) => ({
      type: GET_VHTS_SUCCESS,
      payload: response,
    }),
    (error) => ({
      type: GET_VHTS_ERR,
      payload: error,
    })
  );
};

export const updateUser = (userId, data) => {
  return requestActionCreator(
    `${Endpoint.USER}${Endpoint.EDIT}/${userId}}`,
    Method.PUT,
    data,
    (response) => ({
      type: UPDATE_USERS_SUCCESS,
      payload: response,
    }),
    (error) => ({
      type: UPDATE_USERS_ERR,
      payload: error,
    })
  );
};

export const deleteUser = (userId) => {
  return requestActionCreator(
    `${Endpoint.USER}${Endpoint.DELETE}/${userId}}`,
    Method.DELETE,
    null,
    () => ({
      type: DELETE_USERS_SUCCESS,
    }),
    (message) => ({
      type: DELETE_USERS_ERR,
      payload: message,
    })
  );
};

export const logoutUserAction = () => ({
  type: LOGOUT_USER,
});

export const getUsersRequested = () => ({
  type: GET_USERS_REQ,
});

export const getVhtsRequested = () => ({
  type: GET_VHTS_REQ,
});

export const deleteUserRequested = () => ({
  type: DELETE_USERS_REQ,
});

export const updateUserRequested = () => ({
  type: UPDATE_USERS_REQ,
});

export const registerUserDefault = () => ({
  type: REGISTER_USER_DEFAULT,
});

const currentUserReducer = (
  state = {
    currentUser: {},
  },
  action
) => {
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

const userErrorReducer = (state = {}, action) => {
  switch (action.type) {
    case 'INVALID_USER':
      return action.payload.response.data.message;
    default:
      return '';
  }
};

const registerStatusReducer = (state = {}, action) => {
  switch (action.type) {
    case 'REGISTER_SUCCESS':
      return {
        message: 'Success! User has been successfully created',
        error: false,
        userCreated: true,
      };
    case 'REGISTER_ERROR':
      return {
        message: action.payload,
        error: true,
        userCreated: false,
      };
    case REGISTER_USER_DEFAULT:
      return {
        ...state,
        userCreated: false,
      };
    default:
      return { userCreated: false };
  }
};

const allUsersReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_USERS_SUCCESS:
      return {
        ...state,
        usersList: action.payload.data,
        isLoading: false,
        updateUserList: false,
      };

    case GET_USERS_REQ:
      return {
        ...state,
        isLoading: true,
      };

    case GET_USERS_ERR:
      return {
        ...state,
        isLoading: false,
        updateUserList: false,
      };

    // TODO: get users list if necessary
    case DELETE_USERS_SUCCESS:
    case UPDATE_USERS_SUCCESS:
      return {
        ...state,
        updateUserList: true,
      };

    case DELETE_USERS_ERR:
      return {
        ...state,
        updateUserList: false,
      };

    default:
      return state;
  }
};

const allVhtsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_VHTS_SUCCESS:
      return {
        ...state,
        vhtList: action.payload.data,
        isLoading: false,
      };

    case GET_VHTS_REQ:
      return {
        ...state,
        isLoading: true,
      };

    case GET_VHTS_ERR:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};

export const userReducer = combineReducers({
  currentUser: currentUserReducer,
  registerStatus: registerStatusReducer,
  allUsers: allUsersReducer,
  allVhts: allVhtsReducer,
  serverLoginErrorMessage: userErrorReducer,
});
