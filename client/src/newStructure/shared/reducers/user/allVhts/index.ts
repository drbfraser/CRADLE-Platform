import { OrNull, VHT } from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../../utils';

import { Endpoints } from '../../../../server/endpoints';

enum AllVhtsActionEnum {
  CLEAR_REQUEST_OUTCOME = 'allVhts/CLEAR_REQUEST_OUTCOME',
  GET_VHTS_ERROR = 'allVhts/GET_VHTS_ERROR',
  GET_VHTS_SUCCESS = 'allVhts/GET_VHTS_SUCCESS',
  START_REQUEST = 'allVhts/START_REQUEST',
}

type AllVhtsAction =
  | { type: AllVhtsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: AllVhtsActionEnum.GET_VHTS_ERROR; payload: { message: string } }
  | { type: AllVhtsActionEnum.GET_VHTS_SUCCESS; payload: { vhts: Array<VHT> } }
  | { type: AllVhtsActionEnum.START_REQUEST };

// const startRequest = (): AllVhtsAction => ({
//   type: AllVhtsActionEnum.START_REQUEST,
// });

// type AllVhtsRequest = Callback<Callback<AllVhtsAction>, ServerRequestAction>;

export const getVhts = (): ServerRequestAction => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.USER}${Endpoints.VHTS}`,
    onSuccess: ({ data: vhts }: { data: Array<VHT> }): AllVhtsAction => {
      return {
        type: AllVhtsActionEnum.GET_VHTS_SUCCESS,
        payload: { vhts },
      };
    },
    onError: (message: string): AllVhtsAction => ({
      type: AllVhtsActionEnum.GET_VHTS_ERROR,
      payload: { message },
    }),
  });
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
    case AllVhtsActionEnum.GET_VHTS_SUCCESS:
      return {
        ...initialState,
        data: action.payload.vhts,
      };
    case AllVhtsActionEnum.START_REQUEST:
      return {
        ...initialState,
        loading: true,
      };
    case AllVhtsActionEnum.GET_VHTS_ERROR:
      return {
        ...initialState,
        error: true,
        message: action.payload.message,
      };
    default:
      return state;
  }
};
