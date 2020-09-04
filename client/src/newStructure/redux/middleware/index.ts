import { BASE_URL } from '../../server/utils';
import { EndpointEnum } from '../../server';
import { MakeServerRequestEnum } from '../reducers/utils';
import { MethodEnum } from '../../server';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { logoutUser } from '../reducers/user/currentUser';
import { replace } from 'connected-react-router';

export const requestMiddleware = () => ({ dispatch }: any) => (
  next: any
) => async (action: any) => {
  if (action.type !== MakeServerRequestEnum.MAKE_SERVER_REQUEST) {
    next(action);
    return;
  }

  let token = localStorage.getItem(`token`);
  const decodedToken = token ? jwt_decode<{ exp: number }>(token) : null;
  const currentTime = new Date().getTime() / 1000;
  const { endpoint, method, data, onSuccess, onError } = action.payload;

  const renewToken =
    decodedToken &&
    currentTime > decodedToken.exp &&
    endpoint !== `${EndpointEnum.USER}${EndpointEnum.AUTH}`;

  if (renewToken) {
    const refreshToken = localStorage.refresh;
    try {
      const response = await axios({
        method: MethodEnum.POST,
        url: `${BASE_URL}${EndpointEnum.USER}${EndpointEnum.AUTH}${EndpointEnum.REFRESH}`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      localStorage.setItem('token', response.data.token);
      token = localStorage.token;
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      dispatch(logoutUser());
      dispatch(replace(`/login`));
      return;
    }
  }

  axios({
    method: method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
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
