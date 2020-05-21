import { BASE_URL } from '../../../server/utils';
import { Endpoints } from '../../../server/endpoints';
import { MAKE_SERVER_REQUEST } from '../../../shared/reducers/utils';
import { Methods } from '../../../server/methods';
import axios from 'axios';
import { go } from 'connected-react-router';
import jwt_decode from 'jwt-decode';
import { logoutUserAction } from '../../../shared/reducers/user/currentUser';

export const requestMiddleware = () => ({ dispatch }) => (next) => async (
  action
) => {
  if (action.type !== MAKE_SERVER_REQUEST) {
    next(action);
    return;
  }

  let token = localStorage.token;
  const decodedToken = token && jwt_decode(token);
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
      console.log(error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      dispatch(logoutUserAction());
      dispatch(go('/login'));
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
    .then((res) => dispatch(onSuccess(res)))
    .catch((err) => dispatch(onError(err)));
};
