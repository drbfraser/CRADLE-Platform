import { Endpoints } from '../../../../server/endpoints';

const GET_VHTS_SUCCESS = `user/GET_VHTS_SUCCESS`;
const GET_VHTS_REQUEST = `user/GET_VHTS_REQUEST`;
const GET_VHTS_ERROR = `user/GET_VHTS_ERROR`;

export const getVhtsRequested = () => ({
  type: GET_VHTS_REQUEST,
});

export const getVhtList = () => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.VHTS}`,
    onSuccess: (response) => ({
      type: GET_VHTS_SUCCESS,
      payload: response,
    }),
    onError: (error) => ({
      type: GET_VHTS_ERROR,
      payload: error,
    }),
  });
};

export const allVhtsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_VHTS_SUCCESS:
      return {
        ...state,
        vhtList: action.payload.data,
        isLoading: false,
      };

    case GET_VHTS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case GET_VHTS_ERROR:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};
