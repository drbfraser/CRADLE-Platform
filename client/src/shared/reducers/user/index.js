import { Endpoint, Method } from '../../../api/constants';

import { combineReducers } from 'redux';
import { getUserFromResponse } from '../../utils';
import { push } from 'connected-react-router';
import { requestActionCreator } from '../../../actions/api';

export const GET_USERS_SUCCESS = `users/GET_USERS_SUCCESS`;
export const GET_USERS_REQ = `users/GET_USERS_REQ`;
export const GET_USERS_ERR = `users/GET_USERS_ERR`;

export const GET_VHTS_SUCCESS = `users/GET_VHTS_SUCCESS`;
export const GET_VHTS_REQ = `users/GET_VHTS_REQ`;
export const GET_VHTS_ERR = `users/GET_VHTS_ERR`;

export const UPDATE_USERS_SUCCESS = `users/UPDATE_USERS_SUCCESS`;
export const UPDATE_USERS_REQ = `users/UPDATE_USERS_REQ`;
export const UPDATE_USERS_ERR = `users/UPDATE_USERS_ERR`;

export const DELETE_USERS_SUCCESS = `users/DELETE_USERS_SUCCESS`;
export const DELETE_USERS_REQ = `users/DELETE_USERS_REQ`;
export const DELETE_USERS_ERR = `users/DELETE_USERS_ERR`;

export const USER_LOGIN_SUCCESS = `USER_LOGIN_SUCCESS`;
export const REGISTER_USER_DEFAULT = `REGISTER_USER_DEFAULT`;

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
  type: `LOGOUT_USER`,
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

const initialStateUser = {
  currentUser: {},
};

const currentUserReducer = (state = initialStateUser, action) => {
  switch (action.type) {
    case 'LOGIN_USER':
      return action.payload.data;
    case 'LOGOUT_USER':
      return { isLoggedIn: false };
    case USER_LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.data.token);
      localStorage.setItem('refresh', action.payload.data.refresh);
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
