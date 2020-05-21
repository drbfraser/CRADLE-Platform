import { Method as AxiosMethod } from 'axios';

export const Methods: { [key: string]: AxiosMethod } = {
  GET: `get`,
  POST: `post`,
  PUT: `put`,
  DELETE: `delete`,
};
