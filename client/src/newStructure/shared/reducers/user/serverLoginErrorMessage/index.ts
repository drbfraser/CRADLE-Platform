export const INVALID_USER = `user/INVALID_USER`;

export const serverLoginErrorMessageReducer = (_: any, action: any) => {
  switch (action.type) {
    case INVALID_USER:
      return action.payload.response.data.message;
    default:
      return ``;
  }
};
