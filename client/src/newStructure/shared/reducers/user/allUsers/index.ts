import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';
import { serverRequestActionCreator, ServerRequestAction } from '../../utils';
import { User, OrNull } from '@types';

enum AllUsersActionEnum {
  CLEAR_REQUEST_OUTCOME = 'users/CLEAR_REQUEST_OUTCOME',
  DELETE_USER_SUCCESS = 'users/DELETE_USER_SUCCESS',
  DELETE_USER_ERROR = 'users/DELETE_USER_ERROR',
  GET_USERS_SUCCESS = 'users/GET_USERS_SUCCESS',
  GET_USERS_ERROR = 'users/GET_USERS_ERROR',
  START_REQUEST = 'users/START_REQUEST',
  UPDATE_USER_SUCCESS = 'users/UPDATE_USERS_SUCCESS',
  UPDATE_USER_ERROR = 'users/UPDATE_USER_ERROR',
}

type ErrorPayload = { message: string };

type AllUsersAction =
  | { type: AllUsersActionEnum.CLEAR_REQUEST_OUTCOME }
  | {
      type: AllUsersActionEnum.DELETE_USER_SUCCESS;
      payload: { deletedUserId: number };
    }
  | { type: AllUsersActionEnum.DELETE_USER_ERROR; payload: ErrorPayload }
  | {
      type: AllUsersActionEnum.GET_USERS_SUCCESS;
      payload: { users: Array<User> };
    }
  | { type: AllUsersActionEnum.GET_USERS_ERROR; payload: ErrorPayload }
  | { type: AllUsersActionEnum.START_REQUEST }
  | {
      type: AllUsersActionEnum.UPDATE_USER_SUCCESS;
      payload: { updatedUser: User };
    }
  | { type: AllUsersActionEnum.UPDATE_USER_ERROR; payload: ErrorPayload };

// const startRequest = (): AllUsersAction => ({
// type: AllUsersActionEnum.START_REQUEST,
// });

// type AllUsersRequest = Callback<Callback<AllUsersAction>, ServerRequestAction>;

export const getUsers = (): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.ALL}`,
    onSuccess: ({ data: users }: { data: Array<User> }): AllUsersAction => ({
      type: AllUsersActionEnum.GET_USERS_SUCCESS,
      payload: { users },
    }),
    onError: (message: string): AllUsersAction => ({
      type: AllUsersActionEnum.GET_USERS_ERROR,
      payload: { message },
    }),
  });
};

export const updateUser = (
  userId: string,
  updatedUser: User
): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.EDIT}/${userId}`,
    data: updatedUser,
    method: Methods.PUT,
    onSuccess: (): AllUsersAction => ({
      type: AllUsersActionEnum.UPDATE_USER_SUCCESS,
      payload: { updatedUser },
    }),
    onError: (message: string): AllUsersAction => ({
      type: AllUsersActionEnum.UPDATE_USER_ERROR,
      payload: { message },
    }),
  });
};

export const deleteUser = (userId: number): ServerRequestAction => {
  return serverRequestActionCreator({
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
  });
};

export const clearAllUsersRequestOutcome = (): AllUsersAction => ({
  type: AllUsersActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type AllUsersState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  updatedUserList: boolean;
  data: OrNull<Array<User>>;
  fetched: boolean;
};

const initialState: AllUsersState = {
  error: false,
  loading: false,
  message: null,
  updatedUserList: false,
  data: null,
  fetched: false,
};

export const allUsersReducer = (
  state = initialState,
  action: AllUsersAction
): AllUsersState => {
  switch (action.type) {
    case AllUsersActionEnum.CLEAR_REQUEST_OUTCOME:
      return { ...initialState, data: state.data };
    case AllUsersActionEnum.DELETE_USER_ERROR:
      return { ...initialState, error: true, message: action.payload.message };
    case AllUsersActionEnum.DELETE_USER_SUCCESS:
      return {
        ...initialState,
        updatedUserList: true,
        data:
          state.data?.filter(
            ({ userId }: User): boolean =>
              userId !== action.payload.deletedUserId
          ) ?? null,
      };
    case AllUsersActionEnum.GET_USERS_ERROR:
      return { ...initialState, error: true, message: action.payload.message };
    case AllUsersActionEnum.GET_USERS_SUCCESS:
      return {
        ...initialState,
        updatedUserList: true,
        data: action.payload.users,
        fetched: true,
      };
    case AllUsersActionEnum.START_REQUEST:
      return { ...initialState, data: state.data, loading: true };
    case AllUsersActionEnum.UPDATE_USER_ERROR:
      return { ...initialState, error: true, message: action.payload.message };
    case AllUsersActionEnum.UPDATE_USER_SUCCESS:
      return {
        ...initialState,
        updatedUserList: true,
        data:
          state.data?.filter(
            ({ userId }: User): boolean =>
              userId !== action.payload.updatedUser.userId
          ) ?? null,
      };
    default:
      return state;
  }
};
