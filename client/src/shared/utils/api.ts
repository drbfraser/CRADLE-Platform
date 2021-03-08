import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { reduxStore } from 'src/redux/store';
import { MethodEnum, EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';

export const getApiToken = async () => {
  let token = localStorage.getItem(`token`);

  try {
    const decodedToken = token ? jwt_decode<{ exp: number }>(token) : null;
    const currentTime = new Date().getTime() / 1000;

    const shouldRefreshToken =
      !decodedToken || currentTime > decodedToken.exp + 5;

    if (shouldRefreshToken) {
      const refreshToken = localStorage.refresh;

      const response = await axios({
        method: MethodEnum.POST,
        url: `${BASE_URL}${EndpointEnum.USER}${EndpointEnum.AUTH}${EndpointEnum.REFRESH}`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      console.log(response);
      localStorage.setItem('token', response.data.token);
      token = localStorage.token;
    }
  } catch (error) {
    console.error(error);
    reduxStore.dispatch(logoutUser());
  }

  return token;
};

export const apiFetch = async (
  input: RequestInfo,
  init?: RequestInit | undefined
): Promise<Response> => {
  const token = await getApiToken();

  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
};
