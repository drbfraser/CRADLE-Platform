import { BASE_URL } from '../../../server/utils';
import { Endpoints } from '../../../server/endpoints';
import { MakeServerRequestEnum } from '../../../shared/reducers/utils';
import { Methods } from '../../../server/methods';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { logoutUser } from '../../../shared/reducers/user/currentUser';
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
    endpoint !== `${Endpoints.USER}${Endpoints.AUTH}`;

  if (renewToken) {
    const refreshToken = localStorage.refresh;
    try {
      const response = await axios({
        method: Methods.POST,
        url: BASE_URL + Endpoints.USER + Endpoints.AUTH + Endpoints.REFRESH,
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
    url: BASE_URL + endpoint,
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
            err.response?.data.message ??
            `Something went wrong on our end. We are trying to get it fixed`,
          status: err.response?.status ?? 500,
        })
      );
    });
};
