import { Methods } from "../../../server/methods";

export const MAKE_SERVER_REQUEST = `MAKE_SERVER_REQUEST`;

export const serverRequestActionCreator = ({
  endpoint,
  onSuccess,
  onError,
  data = null,
  method = Methods.GET,
}) => {
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
