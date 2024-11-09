import { API_URL } from 'src/shared/api/api';
import { MakeServerRequestEnum } from '../reducers/utils';
import axios from 'axios';
import { getApiToken } from 'src/shared/api/api';
import { EndpointEnum } from 'src/shared/enums';
import { snakeCase, camelCase } from 'lodash';

/* Applies transform function to the keys of the object recursively, so nested
properties will be transformed correctly. */
const recursivelyTransformKeys = (
  obj: unknown,
  transformKey: (key: string) => string
): any => {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map((elem) => {
      // Recursively call function on elements of array.
      return recursivelyTransformKeys(elem, transformKey);
    });
  }
  if (typeof obj !== 'object') return obj;
  const o: { [key: string]: any } = obj;
  return Object.keys(obj).reduce((prevVal, key) => {
    return {
      ...prevVal,
      [transformKey(key)]: recursivelyTransformKeys(o[key], transformKey),
    };
  }, {});
};

// Convert the object's keys to snake case.
const convertKeysToSnakeCase = (data: object) => {
  return recursivelyTransformKeys(data, snakeCase);
};
// Convert the object's keys to camel case.
const convertKeysToCamelCase = (data: object) => {
  return recursivelyTransformKeys(data, camelCase);
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
        (data: string) => {
          // Parse json string into object.
          const parsedData = JSON.parse(data);
          // Intercept data from the response and convert keys to camel case.
          const transformedData = convertKeysToCamelCase(parsedData);
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
