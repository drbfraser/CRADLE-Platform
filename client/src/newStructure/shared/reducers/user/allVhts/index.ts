import { Endpoints } from '../../../../server/endpoints';
import { serverRequestActionCreator, ServerRequestAction } from '../../utils';
import { User, Callback, OrNull } from '@types';

const GET_VHTS_REQUEST = `user/GET_VHTS_REQUEST`;

enum AllVhtsActionEnum {
  CLEAR_REQUEST_OUTCOME = 'allVhts/CLEAR_REQUEST_OUTCOME',
  GET_VHTS_ERROR = 'allVhts/GET_VHTS_ERROR',
  GET_VHTS_SUCCESS = 'allVhts/GET_VHTS_SUCCESS',
  START_REQUEST = 'allVhts/START_REQUEST',
}

type AllVhtsAction =
  | { type: AllVhtsActionEnum.CLEAR_REQUEST_OUTCOME }
  | { type: AllVhtsActionEnum.GET_VHTS_ERROR, payload: { message: string } }
  | { type: AllVhtsActionEnum.GET_VHTS_SUCCESS, payload: { vhts: Array<User> } }
  | { type: AllVhtsActionEnum.START_REQUEST };

export const getVhtsRequested = () => ({
  type: GET_VHTS_REQUEST,
});

const startRequest = (): AllVhtsAction => ({
  type: AllVhtsActionEnum.START_REQUEST,
});

type AllVhtsRequest = Callback<Callback<AllVhtsAction>, ServerRequestAction>;

export const getVhts = (): AllVhtsRequest => {
  return (dispatch: Callback<AllVhtsAction>): ServerRequestAction => {
    dispatch(startRequest());

    return serverRequestActionCreator({
      endpoint: `${Endpoints.USER}${Endpoints.VHTS}`,
      onSuccess: (vhts: Array<User>): AllVhtsAction => ({
        type: AllVhtsActionEnum.GET_VHTS_SUCCESS,
        payload: { vhts },
      }),
      onError: (message: string): AllVhtsAction => ({
        type: AllVhtsActionEnum.GET_VHTS_ERROR,
        payload: { message },
      }),
    })
  };
};

export const clearAllVhtsRequestOutcome = () => ({
  type: AllVhtsActionEnum.CLEAR_REQUEST_OUTCOME,
});

export type AllVhtsState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  vhts: OrNull<Array<User>>;
}

const initialState: AllVhtsState = {
  error: false,
  loading: false,
  message: null,
  vhts: null,
}

export const allVhtsReducer = (
  state = initialState, 
  action: AllVhtsAction
): AllVhtsState => {
  switch (action.type) {
    case AllVhtsActionEnum.CLEAR_REQUEST_OUTCOME:
      return { ...initialState, vhts: state.vhts };
    case AllVhtsActionEnum.GET_VHTS_SUCCESS:
      return {
        ...initialState,
        vhts: action.payload.vhts,
      };
    case AllVhtsActionEnum.START_REQUEST:
      return {
        ...initialState,
        loading: true,
      };
    case AllVhtsActionEnum.GET_VHTS_SUCCESS:
      return {
        ...initialState,
        vhts: action.payload.vhts,
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
