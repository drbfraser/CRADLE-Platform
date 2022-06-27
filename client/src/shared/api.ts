import { EndpointEnum, MethodEnum } from './enums';

import jwt_decode from 'jwt-decode';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { reduxStore } from 'src/redux/store';

export const API_URL =
  process.env.NODE_ENV === `development`
    ? `http://${window.location.hostname}:5000/api`
    : '/api';

export const getApiToken = async () => {
  let token = localStorage.getItem(`token`);

  try {
    const decodedToken = token ? jwt_decode<{ exp: number }>(token) : null;
    const currentTime = new Date().getTime() / 1000;

    const shouldRefreshToken =
      !decodedToken || currentTime > decodedToken.exp + 30;

    if (shouldRefreshToken) {
      const refreshToken = localStorage.refresh;

      if (!refreshToken) {
        throw new Error();
      }

      const init = {
        method: MethodEnum.POST,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      };

      const resp = await fetch(`${API_URL}${EndpointEnum.REFRESH}`, init);

      if (!resp.ok) {
        throw new Error();
      }

      token = (await resp.json()).data.token;
      localStorage.setItem('token', token!);
    }
  } catch (e) {
    reduxStore.dispatch(logoutUser());
  }

  return token;
};

export const apiFetch = async (
  input: RequestInfo,
  init?: RequestInit | undefined,
  isFormData?: boolean,
  needErrorInfo?: boolean
): Promise<Response> => {
  const token = await getApiToken();
  const contentType: {
    Accept: string;
    'Content-Type'?: string;
  } = {
    Accept: 'application/json',
  };

  if (isFormData) {
    contentType['Content-Type'] = 'application/json';
  }

  return fetch(input, {
    ...init,
    headers: {
      ...contentType,
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  }).then((resp) => {
    if (!resp.ok) {
      throw needErrorInfo ? resp : resp.status;
    }
    return resp;
  });
};
