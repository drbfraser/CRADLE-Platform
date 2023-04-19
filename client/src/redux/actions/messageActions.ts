// Define the action type constants for showing and hiding messages
export const SHOW_MESSAGE = 'SHOW_MESSAGE';
export const HIDE_MESSAGE = 'HIDE_MESSAGE';

// Define the showMessage action creator
// It takes a message string as a parameter and returns an action object
// with the type SHOW_MESSAGE and the payload set to the message
export const showMessage = (message: string) => ({
  type: SHOW_MESSAGE,
  payload: message,
});

// Define the hideMessage action creator
// It doesn't take any parameters and returns an action object
// with the type HIDE_MESSAGE
export const hideMessage = () => ({
  type: HIDE_MESSAGE,
});

// Export an empty object for compatibility with other imports
export {};
