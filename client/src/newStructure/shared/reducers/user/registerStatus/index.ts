import { Endpoints } from '../../../../server/endpoints';
import { Methods } from '../../../../server/methods';
import { serverRequestActionCreator } from '../../utils';

const REGISTER_USER_DEFAULT = `user/REGISTER_USER_DEFAULT`;
const REGISTER_USER_SUCCESS = `user/REGISTER_USER_SUCCESS`;
const REGISTER_USER_ERROR = `user/REGISTER_USER_ERROR`;

export const registerUserDefault = () => ({
  type: REGISTER_USER_DEFAULT,
});

export const registerUser = (data: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.REGISTER}`,
    method: Methods.POST,
    data,
    onSuccess: () => ({
      type: REGISTER_USER_SUCCESS,
    }),
    onError: (message: any) => ({
      type: REGISTER_USER_ERROR,
      payload: message,
    }),
  });
};

export const registerStatusReducer = (state = {}, action: any) => {
  switch (action.type) {
    case REGISTER_USER_SUCCESS:
      return {
        message: 'Success! User has been successfully created',
        error: false,
        userCreated: true,
      };
    case REGISTER_USER_ERROR:
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
