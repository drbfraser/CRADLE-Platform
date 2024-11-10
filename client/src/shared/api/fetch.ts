import axios from 'axios';

import { snakeCase, camelCase } from 'lodash';
import { EndpointEnum } from '../enums';
import { API_URL, getApiToken } from './api';

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

axios.defaults.transformRequest = [
  (data: object) => {
    // Before putting the data in the request, convert keys to snake case
    // as the server will be expecting the data to be in snake case.
    const transformedData = convertKeysToSnakeCase(data);
    return JSON.stringify(transformedData);
  },
];
axios.defaults.transformResponse = [
  (data: string) => {
    // Parse json string into object.
    const parsedData = JSON.parse(data);
    // Intercept data from the response and convert keys to camel case.
    const transformedData = convertKeysToCamelCase(parsedData);
    return transformedData;
  },
];

type AxiosFetchArgs = {
  method: string;
  endpoint: string;
  params?: URLSearchParams;
  data?: unknown;
  signal?: AbortSignal;
};
export const axiosFetch = async ({
  method,
  endpoint,
  params,
  data,
  signal,
}: AxiosFetchArgs) => {
  let authHeader = {};
  if (endpoint !== EndpointEnum.AUTH) {
    const accessToken = await getApiToken();

    authHeader = {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  return axios({
    method: method,
    url: `${API_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeader,
    },
    params: params,
    data: data,
    signal: signal,
  });
};
