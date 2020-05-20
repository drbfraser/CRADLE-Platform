import { ActionType } from './types'

export const requestActionCreator = (
  endpoint,
  method,
  data,
  onSuccess,
  onError
) => {
  return {
    type: ActionType.API,
    payload: {
      endpoint,
      method,
      data,
      onSuccess,
      onError
    }
  }
}
