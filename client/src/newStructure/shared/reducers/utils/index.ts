import { Method as AxiosMethod } from 'axios';
import { Methods } from "../../../server/methods";

export const MAKE_SERVER_REQUEST = `MAKE_SERVER_REQUEST`;

interface IArgs {
  endpoint: string,
  onSuccess: any,
  onError: any,
  data?: any,
  method?: AxiosMethod,
}

export const serverRequestActionCreator = ({
  endpoint,
  onSuccess,
  onError,
  data = null,
  method = Methods.GET,
}: IArgs) => {
  return {
    type: MAKE_SERVER_REQUEST,
    payload: {
      endpoint,
      method,
      data,
      onSuccess,
      onError,
    },
  };
};
