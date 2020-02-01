import { push } from 'connected-react-router'
import axios from 'axios';

import BASE_URL from '../serverUrl'
import { requestActionCreator } from './api';
import { Endpoint, Method } from '../api/constants';

export const GET_USERS_SUCCESS = 'users/GET_USERS_SUCCESS'
export const GET_USERS_REQ  = 'users/GET_USERS_REQ'
export const GET_USERS_ERR = 'users/GET_USERS_ERR'

export const GET_VHTS_SUCCESS = 'users/GET_VHTS_SUCCESS'
export const GET_VHTS_REQ  = 'users/GET_VHTS_REQ'
export const GET_VHTS_ERR = 'users/GET_VHTS_ERR'

export const UPDATE_USERS_SUCCESS = 'users/UPDATE_USERS_SUCCESS'
export const UPDATE_USERS_REQ  = 'users/UPDATE_USERS_REQ'
export const UPDATE_USERS_ERR = 'users/UPDATE_USERS_ERR'

export const DELETE_USERS_SUCCESS = 'users/DELETE_USERS_SUCCESS'
export const DELETE_USERS_REQ  = 'users/DELETE_USERS_REQ'
export const DELETE_USERS_ERR = 'users/DELETE_USERS_ERR'

export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'

export const registerUser = user => {
  return requestActionCreator(
    Endpoint.USER + Endpoint.REGISTER,
    Method.POST,
    user,
    registerSuccess,
    registerError
  )
}

export const userLoginFetch = user => {
  return requestActionCreator(
    Endpoint.USER + Endpoint.AUTH,
    Method.POST,
    user,
    userLoginOnSuccess,
    invalidUser
  )
}

// TODOs: don't call this everywhere, call only when user logging in
// turn this into an action
// store current user info in localStorage
export const getCurrentUser = () => {
  return dispatch => {
    const token = localStorage.token;
      return axios.get(BASE_URL + "/user/current", {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.msg) {
            console.log(res)
            // invalid token, remove current token
            localStorage.removeItem("token")
            dispatch(push('/login'))
          } else {
            console.log(res)
            dispatch(loginUser(res.data))
          }
        }).catch((err) => { 
          dispatch(push('/login'))
          return {'message' : 'Not authorized'}
        } )
    }
}

export const getUsers = () => {
  return requestActionCreator(
    Endpoint.USER + Endpoint.ALL,
    Method.GET,
    null,
    getUsersOnSuccess,
    getUsersOnError
  )
}

export const getVhtList = () => {
  return requestActionCreator(
    Endpoint.USER + Endpoint.VHTS,
    Method.GET,
    null,
    getVhtsOnSuccess,
    getVhtsOnError
  )
}

export const updateUser = (userId, data) => {
  return requestActionCreator(
    Endpoint.USER + Endpoint.EDIT + '/' + userId,
    Method.PUT,
    data,
    updateUserOnSuccess,
    updateUserOnError
  )
}

export const deleteUser = (userId) => {
  return requestActionCreator(
    Endpoint.USER + Endpoint.DELETE + '/' + userId,
    Method.DELETE,
    null,
    deleteUserOnSuccess,
    deleteUserOnError
  )
}

export const logoutUser = () => {
  return dispatch => {
    localStorage.removeItem("token")
    dispatch(logoutUserAction())
    dispatch(push('/login'))
  }
}

export const logoutUserAction = () => ({
  type: 'LOGOUT_USER'
})

const loginUser = userObj => ({
  type: 'LOGIN_USER',
  payload: userObj
})

const registerSuccess = () => ({
  type: 'REGISTER_SUCCESS',
})

const registerError = (message) => ({
  type: 'REGISTER_ERROR',
  payload: message
})

const invalidUser = (message) => ({
  type: 'INVALID_USER',
  payload: message
})

const userLoginOnSuccess = response => ({
  type: USER_LOGIN_SUCCESS,
  payload: response
})

const getUsersOnSuccess = response => ({
  type: GET_USERS_SUCCESS,
  payload: response
})

const getUsersOnError = error => ({
  type: GET_USERS_ERR,
  payload: error
})

export const getUsersRequested = () => ({
  type: GET_USERS_REQ
})

const getVhtsOnSuccess = response => ({
  type: GET_VHTS_SUCCESS,
  payload: response
})

const getVhtsOnError = error => ({
  type: GET_VHTS_ERR,
  payload: error
})

export const getVhtsRequested = () => ({
  type: GET_VHTS_REQ
})

const deleteUserOnSuccess = () => ({
  type: DELETE_USERS_SUCCESS,
})

const deleteUserOnError = (message) => ({
  type: DELETE_USERS_ERR,
  payload: message
})

export const deleteUserRequested = () => ({
  type: DELETE_USERS_REQ
})

export const updateUserRequested = () =>( {
  type: UPDATE_USERS_REQ
})

const updateUserOnSuccess = response => ({
  type: UPDATE_USERS_SUCCESS,
  payload: response
})

const updateUserOnError = error => ({
  type: UPDATE_USERS_ERR,
  payload: error
})