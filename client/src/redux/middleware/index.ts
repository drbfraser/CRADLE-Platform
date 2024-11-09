import { API_URL } from 'src/shared/api';
import { MakeServerRequestEnum } from '../reducers/utils';
import axios from 'axios';
import { getApiToken } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { snakeCase, camelCase } from 'lodash';

// Convert the object's keys to snake case.
const convertKeysToSnakeCase = (data: object) => {
  if (data == null) return null;
  const transformedData: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(data)) {
    transformedData[snakeCase(key)] = value;
  }
  return transformedData;
};
// Convert the object's keys to camel case.
const convertKeysToCamelCase = (data: object) => {
  if (data == null) return null;
  const transformedData: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(data)) {
    transformedData[camelCase(key)] = value;
  }
  return transformedData;
};

export const requestMiddleware =
  () =>
  ({ dispatch }: any) =>
  (next: any) =>
  async (action: any) => {
    if (action.type !== MakeServerRequestEnum.MAKE_SERVER_REQUEST) {
      next(action);
      return;
    }

    const { endpoint, method, data, onSuccess, onError } = action.payload;

    let authHeader = {};

    if (endpoint !== EndpointEnum.AUTH) {
      const accessToken = await getApiToken();

      authHeader = {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    axios({
      method: method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeader,
      },
      transformRequest: [
        (data: object) => {
          // Before putting the data in the request, convert keys to snake case
          // as the server will be expecting the data to be in snake case.
          const transformedData = convertKeysToSnakeCase(data);
          return JSON.stringify(transformedData);
        },
      ],
      transformResponse: [
        (data: object) => {
          // Intercept data from the response and convert keys to camel case.
          const transformedData = convertKeysToCamelCase(data);
          return transformedData;
        },
      ],
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
