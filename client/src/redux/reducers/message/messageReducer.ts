// Import action types for showing and hiding messages
import { HIDE_MESSAGE, SHOW_MESSAGE } from 'src/redux/actions/messageActions';

// Define the initial state for the message reducer
const initialState = {
  message: '',
  showMessage: false,
};

// Define the shape of the MessageState
export type MessageState = {
  message: string;
  showMessage: boolean;
};

// Define the messageReducer function
export const messageReducer = (state = initialState, action: any) => {
  // Determine the new state based on the dispatched action type
  switch (action.type) {
    // If the action is to show a message
    case SHOW_MESSAGE:
      return {
        ...state,
        message: action.payload, 
        showMessage: true, 
      };
    // If the action is to hide a message
    case HIDE_MESSAGE:
      return {
        ...state,
        message: '', 
        showMessage: false, 
      };
    // If the action type doesn't match any known types, return the current state unchanged
    default:
      return state;
  }
};
