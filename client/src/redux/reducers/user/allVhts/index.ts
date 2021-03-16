import { OrNull, ServerError, VHT } from 'src/types';
import { ServerRequestAction, serverRequestActionCreator } from '../../utils';

import { Dispatch } from 'redux';
import { EndpointEnum } from 'src/server';

enum AllVhtsActionEnum {
  GET_VHTS_REQUESTED = 'allVhts/GET_VHTS_REQUESTED',
  GET_VHTS_SUCCESS = 'allVhts/GET_VHTS_SUCCESS',
  GET_VHTS_ERROR = 'allVhts/GET_VHTS_ERROR',
  CLEAR_REQUEST_OUTCOME = 'allVhts/CLEAR_REQUEST_OUTCOME',
}

type AllVhtsAction =
  | { type: AllVhtsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: AllVhtsActionEnum.GET_VHTS_REQUESTED }
  | { type: AllVhtsActionEnum.GET_VHTS_ERROR; payload: { message: string } }
  | { type: AllVhtsActionEnum.GET_VHTS_SUCCESS; payload: { vhts: Array<VHT> } };

const getVHtsRequest = (): AllVhtsAction => ({
  type: AllVhtsActionEnum.GET_VHTS_REQUESTED,
});

export const getVhts = (): ((dispatch: Dispatch) => ServerRequestAction) => {
  return (dispatch: Dispatch) => {
    dispatch(getVHtsRequest());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${EndpointEnum.USER}${EndpointEnum.VHTS}`,
        onSuccess: ({ data: vhts }: { data: Array<VHT> }): AllVhtsAction => {
          return {
            type: AllVhtsActionEnum.GET_VHTS_SUCCESS,
            payload: { vhts },
          };
        },
        onError: ({ message }: ServerError): AllVhtsAction => ({
          type: AllVhtsActionEnum.GET_VHTS_ERROR,
          payload: { message },
        }),
      })
    );
  };
};

export const clearAllVhtsRequestOutcome = () => ({
  type: AllVhtsActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type AllVhtsState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  data: OrNull<Array<VHT>>;
};

const initialState: AllVhtsState = {
  error: false,
  loading: false,
  message: null,
  data: null,
};

export const allVhtsReducer = (
  state = initialState,
  action: AllVhtsAction
): AllVhtsState => {
  switch (action.type) {
    case AllVhtsActionEnum.CLEAR_REQUEST_OUTCOME:
      return { ...initialState, data: state.data };
    case AllVhtsActionEnum.GET_VHTS_REQUESTED: {
      return {
        ...initialState,
        loading: true,
      };
    }
    case AllVhtsActionEnum.GET_VHTS_SUCCESS: {
      return {
        ...initialState,
        data: action.payload.vhts,
      };
    }
    case AllVhtsActionEnum.GET_VHTS_ERROR: {
      return {
        ...initialState,
        error: true,
        message: action.payload.message,
      };
    }
    default:
      return state;
  }
};
