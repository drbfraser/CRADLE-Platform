import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';
import { serverRequestActionCreator, ServerRequestAction } from '../../utils';
import { User, OrNull } from '@types';

enum RegisterStatusEnum {
  CLEAR_REQUEST_OUTCOME = 'registerStatus/CLEAR_REQUEST_OUTCOME',
  REGISTER_USER_SUCCESS = 'registerStatus/REGISTER_USER_SUCCESS',
  REGISTER_USER_ERROR = 'registerStatus/REGISTER_USER_ERROR',
  START_REQUEST = 'registerStatus/START_REQUEST',
}

type RegisterStatusAction =
  | { type: RegisterStatusEnum.CLEAR_REQUEST_OUTCOME }
  | {
      type: RegisterStatusEnum.REGISTER_USER_SUCCESS;
      payload: { message: string };
    }
  | {
      type: RegisterStatusEnum.REGISTER_USER_ERROR;
      payload: { message: string };
    }
  | { type: RegisterStatusEnum.START_REQUEST };

export const clearRegisterStatusOutcome = (): RegisterStatusAction => ({
  type: RegisterStatusEnum.CLEAR_REQUEST_OUTCOME,
});

// type RegisterUserRequest = Callback<Callback<RegisterStatusAction>, ServerRequestAction>;

export const registerUser = (data: User): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.REGISTER}`,
    method: Methods.POST,
    data,
    onSuccess: (): RegisterStatusAction => ({
      type: RegisterStatusEnum.REGISTER_USER_SUCCESS,
      payload: { message: `User successfully created!` },
    }),
    onError: (message: string): RegisterStatusAction => ({
      type: RegisterStatusEnum.REGISTER_USER_ERROR,
      payload: { message },
    }),
  });
};

export type RegisterStatusState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  userCreated: boolean;
};

const initialState: RegisterStatusState = {
  error: false,
  loading: false,
  message: null,
  userCreated: false,
};

export const registerStatusReducer = (
  state = initialState,
  action: RegisterStatusAction
): RegisterStatusState => {
  switch (action.type) {
    case RegisterStatusEnum.CLEAR_REQUEST_OUTCOME:
      return initialState;
    case RegisterStatusEnum.REGISTER_USER_SUCCESS:
      return {
        ...initialState,
        message: action.payload.message,
        userCreated: true,
      };
    case RegisterStatusEnum.REGISTER_USER_ERROR:
      return {
        ...initialState,
        error: true,
        message: action.payload.message,
      };
    case RegisterStatusEnum.START_REQUEST:
      return {
        ...initialState,
        loading: false,
      };
    default:
      return state;
  }
};
