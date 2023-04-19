export const SHOW_MESSAGE = 'SHOW_MESSAGE';
export const HIDE_MESSAGE = 'HIDE_MESSAGE';

export const showMessage = (message: string) => ({
  type: SHOW_MESSAGE,
  payload: message,
});

export const hideMessage = () => ({
  type: HIDE_MESSAGE,
});

export {};