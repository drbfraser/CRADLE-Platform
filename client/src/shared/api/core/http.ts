//Move the Axios instance + helpers into core
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { EndpointEnum } from '../../enums';
import { reduxStore } from 'src/redux/store';
import { clearCurrentUser } from 'src/redux/user-state';
//base URL  
export const API_URL =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? `http://${window.location.hostname}:5000/api`
    : '/api';

//axios instance 
export const axiosFetch = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Necessary for cookies.
});

export const getAccessToken = async () => {
  let accessToken = localStorage.getItem(`accessToken`);

  if (accessToken === null) {
    throw new Error('No access token found!');
  }

  try {
    const decodedToken = accessToken
      ? jwtDecode<{ exp: number; username: string }>(accessToken)
      : null;
    const currentTime = new Date().getTime() / 1000;

    // If access token is expired, we must fetch a new one.
    const shouldRefreshToken =
      !decodedToken || currentTime > decodedToken.exp - 60;

    if (shouldRefreshToken) {
      const username = decodedToken?.username;
      /** Refresh token is stored in HTTP-Only cookie. It should automatically
       *  be sent along with our request to the refresh_token endpoint. */
      const response = await axiosFetch({
        method: 'POST',
        url: EndpointEnum.REFRESH,
        withCredentials: true, // Necessary for cookies.
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          /* Username is needed for the server to get a new access token. */
          username: username,
        },
      });

      accessToken = response.data.accessToken;
      if (!accessToken) {
        throw new Error('Access token was not found in response.');
      }
      localStorage.setItem('accessToken', accessToken);
    }
  } catch (e) {
    console.error(`ERROR Failed to get new access token.`);
    console.error(e);
    localStorage.removeItem('accessToken');
    reduxStore.dispatch(clearCurrentUser());
  }
  return accessToken;
};



//interceptors
// Set interceptor to attach access token to authorization header.
axiosFetch.interceptors.request.use(async (config) => {
  /** Need to be careful here, as it is very easy to accidentally cause an
   *  infinite loop since the refresh endpoint gets called inside of getApiToken.
   */
  if (config.url !== EndpointEnum.AUTH && config.url !== EndpointEnum.REFRESH) {
    const accessToken = await getAccessToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Set interceptor to catch errors.
axiosFetch.interceptors.response.use(undefined, (err) => {
  if (!(err instanceof AxiosError)) return Promise.reject(err);
  const errorBody = err.response?.data;
  console.error('Error Response: ', errorBody);
  if ('description' in errorBody) {
    console.error(errorBody.description);
    return Promise.reject({
      message: errorBody.description,
    });
  }
  if ('message' in errorBody) {
    return Promise.reject(errorBody);
  }
  return Promise.reject(err);
});