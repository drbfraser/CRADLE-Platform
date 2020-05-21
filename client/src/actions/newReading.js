import BASE_URL from '../serverUrl'
import { getPatients } from './patients'
import { Endpoint, Method } from '../api/constants'
import { requestActionCreator } from './api'

export const CREATE_READING_SUCCESS = 'CREATE_READING_SUCCESS'
export const CREATE_READING_ERR = 'CREATE_READING_ERR'
export const CREATE_READING_DEFAULT = 'CREATE_READING_DEFAULT'

export const newReadingPost = reading => {
  return requestActionCreator(
    Endpoint.PATIENT + Endpoint.READING,
    Method.POST,
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
