import { push } from 'connected-react-router';

const CREATE_ROOM = 'chat/CREATE_ROOM';
const JOIN_ROOM = 'chat/JOIN_ROOM';

export const createRoom = (roomId: any) => {
  return (dispatch: any) => {
    dispatch({
      type: CREATE_ROOM,
      payload: roomId,
    });
    dispatch(push('/chat/session/' + roomId));
  };
};

export const joinRoom = (roomId: any) => {
  return (dispatch: any) => {
    dispatch({
      type: JOIN_ROOM,
      payload: roomId,
    });
    dispatch(push('/chat/session/' + roomId));
  };
};


const initialState = {
  roomId: ``,
  isOpener: false,
};

export const chatReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case CREATE_ROOM:
      return {
        ...state,
        isOpener: true,
        roomId: action.payload,
      };

    case JOIN_ROOM:
      return {
        ...state,
        isOpener: false,
        roomId: action.payload,
      };

    default:
      return state;
  }
};
