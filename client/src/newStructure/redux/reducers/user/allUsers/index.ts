import { OrNull, User } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../../utils';

import { Dispatch } from 'redux';
import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';

enum AllUsersActionEnum {
  CLEAR_REQUEST_OUTCOME = 'allUsers/CLEAR_REQUEST_OUTCOME',
  GET_USERS_REQUESTED = 'allUsers/GET_USERS_REQUESTED',
  GET_USERS_SUCCESS = 'allUsers/GET_USERS_SUCCESS',
  GET_USERS_ERROR = 'allUsers/GET_USERS_ERROR',
  SORT_USERS = 'allUsers/SORT_USERS',
  UPDATE_USER_REQUESTED = 'allUsers/UPDATE_USER_REQUESTED',
  UPDATE_USER_SUCCESS = 'allUsers/UPDATE_USER_SUCCESS',
  UPDATE_USER_ERROR = 'allUsers/UPDATE_USER_ERROR',
  DELETE_USER_REQUESTED = 'allUsers/DELETE_USER_REQUESTED',
  DELETE_USER_SUCCESS = 'allUsers/DELETE_USER_SUCCESS',
  DELETE_USER_ERROR = 'allUsers/DELETE_USER_ERROR',
  UPDATE_PAGE_NUMBER = 'allUsers/UPDATE_PAGE_NUMBER',
  UPDATE_SEARCH_TEXT = 'allUsers/UPDATE_SEARCH_TEXT',
}

type ErrorPayload = { message: string };

type AllUsersAction =
  | { type: AllUsersActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: AllUsersActionEnum.DELETE_USER_REQUESTED }
  | {
      type: AllUsersActionEnum.DELETE_USER_SUCCESS;
      payload: { deletedUserId: number };
    }
  | { type: AllUsersActionEnum.DELETE_USER_ERROR; payload: ErrorPayload }
  | { type: AllUsersActionEnum.GET_USERS_REQUESTED }
  | {
      type: AllUsersActionEnum.GET_USERS_SUCCESS;
      payload: { users: Array<User> };
    }
  | { type: AllUsersActionEnum.GET_USERS_ERROR; payload: ErrorPayload }
  | {
      type: AllUsersActionEnum.SORT_USERS;
      payload: { sortedUsers: OrNull<Array<User>> };
    }
  | { type: AllUsersActionEnum.UPDATE_USER_REQUESTED }
  | {
      type: AllUsersActionEnum.UPDATE_USER_SUCCESS;
      payload: { updatedUser: User };
    }
  | { type: AllUsersActionEnum.UPDATE_USER_ERROR; payload: ErrorPayload }
  | {
      type: AllUsersActionEnum.UPDATE_PAGE_NUMBER;
      payload: { pageNumber: number };
    }
  | {
      type: AllUsersActionEnum.UPDATE_SEARCH_TEXT;
      payload: { searchText?: string };
    };

const getUsersRequest = (): AllUsersAction => ({
  type: AllUsersActionEnum.GET_USERS_REQUESTED,
});

export const getUsers = (): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(getUsersRequest());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.USER}${Endpoints.ALL}`,
        onSuccess: ({
          data: users,
        }: {
          data: Array<User>;
        }): AllUsersAction => ({
          type: AllUsersActionEnum.GET_USERS_SUCCESS,
          payload: { users },
        }),
        onError: (message: string): AllUsersAction => ({
          type: AllUsersActionEnum.GET_USERS_ERROR,
          payload: { message },
        }),
      })
    );
  };
};

export const sortUsers = (
  sortedUsers: OrNull<Array<User>>
): AllUsersAction => ({
  type: AllUsersActionEnum.SORT_USERS,
  payload: { sortedUsers },
});

const updateUserRequest = (): AllUsersAction => ({
  type: AllUsersActionEnum.UPDATE_USER_REQUESTED,
});

export const updateUser = (
  userId: string,
  updatedUser: any
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(updateUserRequest());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.USER}${Endpoints.EDIT}/${userId}`,
        data: updatedUser,
        method: Methods.PUT,
        onSuccess: (): AllUsersAction => ({
          type: AllUsersActionEnum.UPDATE_USER_SUCCESS,
          payload: {
            updatedUser: {
              ...updatedUser,
              roleIds: updatedUser.newRoleIds,
              vhtIds: updatedUser.newVhtIds,
              userId,
            },
          },
        }),
        onError: (message: string): AllUsersAction => ({
          type: AllUsersActionEnum.UPDATE_USER_ERROR,
          payload: { message },
        }),
      })
    );
  };
};

const deleteUserRequest = (): AllUsersAction => ({
  type: AllUsersActionEnum.DELETE_USER_REQUESTED,
});

export const deleteUser = (
  userId: number
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(deleteUserRequest());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.USER}${Endpoints.DELETE}/${userId}`,
        method: Methods.DELETE,
        onSuccess: (): AllUsersAction => ({
          type: AllUsersActionEnum.DELETE_USER_SUCCESS,
          payload: { deletedUserId: userId },
        }),
        onError: (message: string): AllUsersAction => ({
          type: AllUsersActionEnum.UPDATE_USER_ERROR,
          payload: { message },
        }),
      })
    );
  };
};

export const clearAllUsersRequestOutcome = (): AllUsersAction => ({
  type: AllUsersActionEnum.CLEAR_REQUEST_OUTCOME,
});

export const updatePageNumber = (pageNumber: number): AllUsersAction => ({
  type: AllUsersActionEnum.UPDATE_PAGE_NUMBER,
  payload: { pageNumber },
});

export const updateSearchText = (searchText?: string): AllUsersAction => ({
  type: AllUsersActionEnum.UPDATE_SEARCH_TEXT,
  payload: { searchText },
});

export type AllUsersState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  pageNumber: number;
  searchText?: string;
  updatedUserList: boolean;
  data: OrNull<Array<User>>;
  fetched: boolean;
};

const initialState: AllUsersState = {
  error: false,
  loading: false,
  message: null,
  pageNumber: 0,
  searchText: ``,
  updatedUserList: false,
  data: null,
  fetched: false,
};

export const allUsersReducer = (
  state = initialState,
  action: AllUsersAction
): AllUsersState => {
  switch (action.type) {
    case AllUsersActionEnum.CLEAR_REQUEST_OUTCOME: {
      return { ...initialState, data: state.data };
    }
    case AllUsersActionEnum.GET_USERS_REQUESTED:
    case AllUsersActionEnum.UPDATE_USER_REQUESTED:
    case AllUsersActionEnum.DELETE_USER_REQUESTED: {
      return { ...initialState, data: state.data, loading: true };
    }
    case AllUsersActionEnum.GET_USERS_SUCCESS: {
      return {
        ...initialState,
        updatedUserList: true,
        data: action.payload.users,
        fetched: true,
      };
    }
    case AllUsersActionEnum.UPDATE_USER_SUCCESS: {
      return {
        ...initialState,
        updatedUserList: true,
        data:
          state.data?.map(
            (user: User): User =>
              user.id === action.payload.updatedUser.id
                ? action.payload.updatedUser
                : user
          ) ?? [],
      };
    }
    case AllUsersActionEnum.DELETE_USER_SUCCESS: {
      return {
        ...initialState,
        updatedUserList: true,
        data:
          state.data?.filter(
            ({ id }: User): boolean => id !== action.payload.deletedUserId
          ) ?? null,
      };
    }
    case AllUsersActionEnum.UPDATE_USER_ERROR:
    case AllUsersActionEnum.DELETE_USER_ERROR:
    case AllUsersActionEnum.GET_USERS_ERROR: {
      return { ...initialState, error: true, message: action.payload.message };
    }
    case AllUsersActionEnum.SORT_USERS: {
      return { ...state, data: action.payload.sortedUsers };
    }
    case AllUsersActionEnum.UPDATE_PAGE_NUMBER: {
      return { ...state, pageNumber: action.payload.pageNumber };
    }
    case AllUsersActionEnum.UPDATE_SEARCH_TEXT: {
      return { ...state, searchText: action.payload.searchText };
    }
    default: {
      return state;
    }
  }
};
