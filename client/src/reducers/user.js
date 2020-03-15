import { combineReducers } from 'redux'

import {
  GET_USERS_REQ,
  GET_USERS_SUCCESS,
  GET_USERS_ERR,
  GET_VHTS_SUCCESS,
  GET_VHTS_REQ,
  GET_VHTS_ERR,
  USER_LOGIN_SUCCESS,
  UPDATE_USERS_SUCCESS,
  DELETE_USERS_SUCCESS,
  DELETE_USERS_ERR,
  REGISTER_USER_DEFAULT
} from '../actions/users'
import { getUserFromResponse } from '../utils'

const initialStateUser = {
  currentUser: {}
}

const userReducer = (state = initialStateUser, action) => {
  switch (action.type) {
    case 'LOGIN_USER':
      return action.payload.data
    case 'LOGOUT_USER':
      return { isLoggedIn: false }
    case USER_LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.data.token)
      localStorage.setItem('refresh', action.payload.data.refresh)
      return {
        ...state,
        ...getUserFromResponse(action.payload.data),
        isLoggedIn: true
      }
    default:
      return state
  }
}

const userErrorReducer = (state = {}, action) => {
  switch (action.type) {
    case 'INVALID_USER':
      return action.payload
    default:
      return ''
  }
}

const registerStatusReducer = (state = {}, action) => {
  switch (action.type) {
    case 'REGISTER_SUCCESS':
      return {
        message: 'Success! User has been successfully created',
        error: false,
        userCreated: true
      }
    case 'REGISTER_ERROR':
      return {
        message: action.payload,
        error: true,
        userCreated: false
      }
    case REGISTER_USER_DEFAULT:
      return {
        ...state,
        userCreated: false
      }
    default:
      return { userCreated: false }
  }
}

const allUsersReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_USERS_SUCCESS:
      return {
        ...state,
        usersList: action.payload.data,
        isLoading: false,
        updateUserList: false
      }

    case GET_USERS_REQ:
      return {
        ...state,
        isLoading: true
      }

    case GET_USERS_ERR:
      return {
        ...state,
        isLoading: false,
        updateUserList: false
      }

    // TODO: get users list if necessary
    case DELETE_USERS_SUCCESS:
    case UPDATE_USERS_SUCCESS:
      return {
        ...state,
        updateUserList: true
      }

    case DELETE_USERS_ERR:
      return {
        ...state,
        updateUserList: false
      }

    default:
      return state
  }
}

const allVhtsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_VHTS_SUCCESS:
      return {
        ...state,
        vhtList: action.payload.data,
        isLoading: false
      }

    case GET_VHTS_REQ:
      return {
        ...state,
        isLoading: true
      }

    case GET_VHTS_ERR:
      return {
        ...state,
        isLoading: false
      }

    default:
      return state
  }
}

export default combineReducers({
  currentUser: userReducer,
  registerStatus: registerStatusReducer,
  allUsers: allUsersReducer,
  allVhts: allVhtsReducer,
  serverLoginErrorMessage: userErrorReducer
})
