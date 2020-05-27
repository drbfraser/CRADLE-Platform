import { push, RouterAction } from 'connected-react-router';
import { Callback } from '@types';

enum ChatActionEnum {
  CREATE_ROOM = 'chat/CREATE_ROOM',
  JOIN_ROOM = 'chat/JOIN_ROOM',
}

type ChatActionPayload = { roomId: string };

type ChatAction = 
 | { type: ChatActionEnum.CREATE_ROOM, payload: ChatActionPayload } 
 | { type: ChatActionEnum.JOIN_ROOM, payload: ChatActionPayload };

type ChatActionCreator = Callback<
  string, 
  Callback<
    Callback<ChatAction | RouterAction>
  >
>;

export const createRoom: ChatActionCreator = (roomId: string) => {
  return (dispatch: Callback<ChatAction | RouterAction>): void => {
    dispatch({
      type: ChatActionEnum.CREATE_ROOM,
      payload: { roomId },
    });
    dispatch(push(`/chat/session/${roomId}`));
  };
};

export const joinRoom: ChatActionCreator = (roomId: string) => {
  return (dispatch: Callback<ChatAction | RouterAction>): void => {
    dispatch({
      type: ChatActionEnum.JOIN_ROOM,
      payload: { roomId },
    });
    dispatch(push(`/chat/session/${roomId}`));
  };
};

export type ChatState = {
  roomId: string;
  isOpener: boolean;
};

const initialState: ChatState = {
  roomId: ``,
  isOpener: false,
};

export const chatReducer = (state = initialState, action: ChatAction) => {
  switch (action.type) {
    case ChatActionEnum.CREATE_ROOM:
      return {
        ...state,
        isOpener: true,
        roomId: action.payload.roomId,
      };

    case ChatActionEnum.JOIN_ROOM:
      return {
        ...state,
        isOpener: false,
        roomId: action.payload.roomId,
      };
    default:
      return state;
  }
};
