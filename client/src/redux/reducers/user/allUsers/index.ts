import { EditUser, OrNull, ServerError, User, VHT } from 'src/types';
import { ServerRequestAction, serverRequestActionCreator } from '../../utils';

import { Dispatch } from 'redux';
import { EndpointEnum } from 'src/server';
import { MethodEnum } from 'src/server';
import { RoleEnum } from 'src/enums';

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
  REGISTER_USER_REQUESTED = 'allUsers/REGISTER_USER_REQUESTED',
  REGISTER_USER_SUCCESS = 'allUsers/REGISTER_USER_SUCCESS',
  REGISTER_USER_ERROR = 'allUsers/REGISTER_USER_ERROR',
  CLEAR_REGISTER_USER_REQUEST_OUTCOME = 'allUsers/CLEAR_REGISTER_USER_REQUEST_OUTCOME',
  UPDATE_PAGE_NUMBER = 'allUsers/UPDATE_PAGE_NUMBER',
  UPDATE_SEARCH_TEXT = 'allUsers/UPDATE_SEARCH_TEXT',
  UPDATE_ROWS_PER_PAGE = 'allUsers/UPDATE_ROWS_PER_PAGE',
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
  | { type: AllUsersActionEnum.REGISTER_USER_REQUESTED }
  | {
      type: AllUsersActionEnum.REGISTER_USER_SUCCESS;
      payload: { registeredUser: User };
    }
  | { type: AllUsersActionEnum.REGISTER_USER_ERROR; payload: ErrorPayload }
  | { type: AllUsersActionEnum.CLEAR_REGISTER_USER_REQUEST_OUTCOME }
  | {
      type: AllUsersActionEnum.UPDATE_PAGE_NUMBER;
      payload: { pageNumber: number };
    }
  | {
      type: AllUsersActionEnum.UPDATE_SEARCH_TEXT;
      payload: { searchText?: string };
    }
  | {
      type: AllUsersActionEnum.UPDATE_ROWS_PER_PAGE;
      payload: { rowsPerPage: number };
    };

const getUsersRequest = (): AllUsersAction => ({
  type: AllUsersActionEnum.GET_USERS_REQUESTED,
});

export const getUsers = (): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(getUsersRequest());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${EndpointEnum.USER}${EndpointEnum.ALL}`,
        onSuccess: ({
          data: users,
        }: {
          data: Array<User>;
        }): AllUsersAction => ({
          type: AllUsersActionEnum.GET_USERS_SUCCESS,
          payload: { users },
        }),
        onError: ({ message }: ServerError): AllUsersAction => ({
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

export type UpdateUser = Pick<
  User,
  'email' | 'firstName' | 'healthFacilityName' | 'username'
> & {
  newRoleIds: Array<number>;
  newVHTs: Array<VHT>;
};

interface IUpdateUserArgs {
  userId: number;
  currentUser: Omit<EditUser, 'healthFacilityName' | 'roleIds' | 'vhtList'>;
  userToUpdate: UpdateUser;
}

export const updateUser = ({
  userId,
  currentUser,
  userToUpdate,
}: IUpdateUserArgs): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(updateUserRequest());

    const { newVHTs, ...data } = userToUpdate;

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${EndpointEnum.USER}${EndpointEnum.EDIT}/${userId}`,
        data: {
          ...data,
          newVhtIds: newVHTs.map((vht: VHT): number => vht.id),
        },
        method: MethodEnum.PUT,
        onSuccess: (): AllUsersAction => ({
          type: AllUsersActionEnum.UPDATE_USER_SUCCESS,
          payload: {
            updatedUser: {
              ...currentUser,
              ...userToUpdate,
              roleIds: userToUpdate.newRoleIds,
              vhtList: userToUpdate.newVHTs,
            },
          },
        }),
        onError: ({ message }: ServerError): AllUsersAction => ({
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
        endpoint: `${EndpointEnum.USER}${EndpointEnum.DELETE}/${userId}`,
        method: MethodEnum.DELETE,
        onSuccess: (): AllUsersAction => ({
          type: AllUsersActionEnum.DELETE_USER_SUCCESS,
          payload: { deletedUserId: userId },
        }),
        onError: ({ message }: ServerError): AllUsersAction => ({
          type: AllUsersActionEnum.DELETE_USER_ERROR,
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

export const updateRowsPerPage = (rowsPerPage: number): AllUsersAction => ({
  type: AllUsersActionEnum.UPDATE_ROWS_PER_PAGE,
  payload: { rowsPerPage },
});

const registerUserRequested = (): AllUsersAction => ({
  type: AllUsersActionEnum.REGISTER_USER_REQUESTED,
});

type RegisterUser = {
  email: string;
  firstName: string;
  password: string;
  role: string;
  healthFacilityName: string;
};

export const registerUser = (
  data: RegisterUser
): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(registerUserRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${EndpointEnum.USER}${EndpointEnum.REGISTER}`,
        method: MethodEnum.POST,
        data,
        onSuccess: ({ data: id }: { data: number }): AllUsersAction => ({
          type: AllUsersActionEnum.REGISTER_USER_SUCCESS,
          payload: {
            registeredUser: {
              ...data,
              associations: [],
              followups: [],
              healthFacility: data.healthFacilityName,
              referrals: [],
              roleIds: [
                Object.values(RoleEnum).indexOf(data.role as RoleEnum) + 1,
              ],
              id,
              tableData: {
                id,
              },
              username: null,
              vhtList: [],
            },
          },
        }),
        onError: ({ message }: ServerError): AllUsersAction => ({
          type: AllUsersActionEnum.REGISTER_USER_ERROR,
          payload: { message },
        }),
      })
    );
  };
};

export const clearRegisterUserRequestOutcome = (): AllUsersAction => ({
  type: AllUsersActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type AllUsersState = {
  created: OrNull<string>;
  createdError: OrNull<string>;
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  pageNumber: number;
  success: OrNull<string>;
  updatedUserList: boolean;
  data: OrNull<Array<User>>;
  fetched: boolean;
  rowsPerPage: number;
  searchText?: string;
};

const initialState: AllUsersState = {
  created: null,
  createdError: null,
  error: false,
  loading: false,
  message: null,
  pageNumber: 0,
  success: null,
  updatedUserList: false,
  data: null,
  fetched: false,
  rowsPerPage: 10,
  searchText: ``,
};

export const allUsersReducer = (
  state = initialState,
  action: AllUsersAction
): AllUsersState => {
  switch (action.type) {
    case AllUsersActionEnum.CLEAR_REQUEST_OUTCOME: {
      return { ...initialState, data: state.data };
    }
    case AllUsersActionEnum.CLEAR_REGISTER_USER_REQUEST_OUTCOME: {
      return { ...state, created: null, createdError: null };
    }
    case AllUsersActionEnum.GET_USERS_REQUESTED:
    case AllUsersActionEnum.UPDATE_USER_REQUESTED:
    case AllUsersActionEnum.DELETE_USER_REQUESTED:
    case AllUsersActionEnum.REGISTER_USER_REQUESTED: {
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
        success: `User updated successfully!`,
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
        success: `User deleted successfully!`,
        data:
          state.data?.filter(
            ({ id }: User): boolean => id !== action.payload.deletedUserId
          ) ?? null,
      };
    }
    case AllUsersActionEnum.REGISTER_USER_SUCCESS: {
      return {
        ...state,
        data: [action.payload.registeredUser, ...(state.data ?? [])],
        loading: false,
        created: `User created successfully!`,
      };
    }
    case AllUsersActionEnum.UPDATE_USER_ERROR:
    case AllUsersActionEnum.DELETE_USER_ERROR:
    case AllUsersActionEnum.GET_USERS_ERROR: {
      return {
        ...state,
        error: true,
        loading: false,
        message: action.payload.message,
      };
    }
    case AllUsersActionEnum.REGISTER_USER_ERROR: {
      return {
        ...state,
        loading: false,
        createdError: action.payload.message,
      };
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
    case AllUsersActionEnum.UPDATE_ROWS_PER_PAGE: {
      return { ...state, rowsPerPage: action.payload.rowsPerPage };
    }
    default: {
      return state;
    }
  }
};
