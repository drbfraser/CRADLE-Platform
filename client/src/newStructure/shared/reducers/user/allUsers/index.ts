import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';
import { serverRequestActionCreator } from '../../utils';

const GET_USERS_REQUEST = `user/GET_USERS_REQUEST`;
const GET_USERS_SUCCESS = `user/GET_USERS_SUCCESS`;
const GET_USERS_ERROR = `user/GET_USERS_ERROR`;

const UPDATE_USER_REQUEST = `user/UPDATE_USER_REQUEST`;
const UPDATE_USER_SUCCESS = `user/UPDATE_USER_SUCCESS`;
const UPDATE_USER_ERROR = `user/UPDATE_USER_ERROR`;

const DELETE_USER_REQUEST = `user/DELETE_USERS_REQUEST`;
const DELETE_USER_SUCCESS = `user/DELETE_USER_SUCCESS`;
const DELETE_USER_ERROR = `user/DELETE_USER_ERROR`;

export const getUsersRequested = () => ({
  type: GET_USERS_REQUEST,
});

export const getUsers = () => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.ALL}`,
    onSuccess: (response: any) => ({
      type: GET_USERS_SUCCESS,
      payload: response,
    }),
    onError: (error: any) => ({
      type: GET_USERS_ERROR,
      payload: error,
    }),
  });
};

export const updateUserRequested = () => ({
  type: UPDATE_USER_REQUEST,
});

export const updateUser = (userId: any, data: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.EDIT}/${userId}}`,
    method: Methods.PUT,
    data,
    onSuccess: (response: any) => ({
      type: UPDATE_USER_SUCCESS,
      payload: response,
    }),
    onError: (error: any) => ({
      type: UPDATE_USER_ERROR,
      payload: error,
    }),
  });
};

export const deleteUserRequested = () => ({
  type: DELETE_USER_REQUEST,
});

export const deleteUser = (userId: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.DELETE}/${userId}}`,
    method: Methods.DELETE,
    onSuccess: () => ({
      type: DELETE_USER_SUCCESS,
    }),
    onError: (message: any) => ({
      type: DELETE_USER_ERROR,
      payload: message,
    }),
  });
};

export const allUsersReducer = (state = {}, action: any) => {
  switch (action.type) {
    case GET_USERS_SUCCESS:
      return {
        ...state,
        usersList: action.payload.data,
        isLoading: false,
        updateUserList: false,
      };

    case GET_USERS_REQUEST:
      return {
        ...state,
        isLoading: true,
      
      
      };

    case GET_USERS_ERROR:
      return {
        ...state,
        isLoading: false,
        updateUserList: false,
      };

    // TODO: get users list if necessary
    case DELETE_USER_SUCCESS:
    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        updateUserList: true,
      };

    case UPDATE_USER_ERROR:
    case DELETE_USER_ERROR:
      return {
        ...state,
        updateUserList: false,
      };

    default:
      return state;
  }
};
