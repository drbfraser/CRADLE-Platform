import { HIDE_MESSAGE, SHOW_MESSAGE } from '../../actions/messageActions';

const initialState = {
  message: '',
  showMessage: false,
};

export type MessageState = {
  message: string;
  showMessage: boolean;
};

export const messageReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SHOW_MESSAGE:
      return {
        ...state,
        message: action.payload,
        showMessage: true,
      };
    case HIDE_MESSAGE:
      return {
        ...state,
        message: '',
        showMessage: false,
      };
    default:
      return state;
  }
};

