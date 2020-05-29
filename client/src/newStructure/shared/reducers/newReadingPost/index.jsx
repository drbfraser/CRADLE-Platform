import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import { serverRequestActionCreator } from '../utils';

export const CREATE_READING_SUCCESS = 'CREATE_READING_SUCCESS'
export const CREATE_READING_ERR = 'CREATE_READING_ERR'
export const CREATE_READING_DEFAULT = 'CREATE_READING_DEFAULT'

export const newReadingPost = reading => {
  return serverRequestActionCreator(
    Endpoints.PATIENT + Endpoints.READING,
    Methods.POST,
    reading,
    createReadingOnSuccess,
    createReadingOnError
  )
}

const createReadingOnSuccess = response => ({
  type: CREATE_READING_SUCCESS,
  payload: response
})

const createReadingOnError = error => ({
  type: CREATE_READING_ERR,
  payload: error
})

export const createReadingDefault = () => ({
  type: CREATE_READING_DEFAULT
})