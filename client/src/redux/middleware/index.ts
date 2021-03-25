import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import { MakeServerRequestEnum } from '../reducers/utils';
import axios from 'axios';
import { getApiToken } from 'src/shared/utils/api';

export const requestMiddleware = () => ({ dispatch }: any) => (
  next: any
) => async (action: any) => {
  if (action.type !== MakeServerRequestEnum.MAKE_SERVER_REQUEST) {
    next(action);
    return;
  }

  const { endpoint, method, data, onSuccess, onError } = action.payload;

  let authHeader = {};

  if (endpoint !== EndpointEnum.AUTH) {
    const token = await getApiToken();

    authHeader = {
      Authorization: `Bearer ${token}`,
    };
  }

  axios({
    method: method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeader,
    },
    data: data,
  })
    .then((res) => {
      return dispatch(onSuccess(res));
    })
    .catch((err) => {
      console.error(err);
      return dispatch(
        onError({
          message:
            err.response?.status === 500 || err.response?.status === undefined
              ? `Something went wrong on our end which means you can't perform this action right now. We are working hard at getting it fixed soon!`
              : err.response?.data.message ?? ``,
          status: err.response?.status ?? 500,
        })
      );
    });
};
