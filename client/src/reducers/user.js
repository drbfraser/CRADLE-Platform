import { combineReducers } from "redux"

import { 
  GET_USERS_REQ,
  GET_USERS_SUCCESS,
  GET_USERS_ERR,
  GET_VHTS_SUCCESS,
  GET_VHTS_REQ,
  GET_VHTS_ERR,
} from '../actions/users';

const initialStateUser = {
  currentUser: {}
}

const initialStateRegisterStatus = {
  registerStatus: {}
}

const userReducer = (state = initialStateUser, action) => {
  switch (action.type) {
    case 'LOGIN_USER':
      return action.payload
    case 'LOGOUT_USER':
      return {}
    case 'INVALID_USER':
      return {}
    default:
      return state
  }
}

const registerStatusReducer = (state = {}, action) => {
  switch (action.type) {
    case 'REGISTER_SUCCESS':
      return { message : "Success! User has been successfully created", error : false }
    case 'REGISTER_ERROR':
      return { message : action.payload, error : true }
    default:
      return {}
  }
}

const allUsersReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_USERS_SUCCESS:
      return {
        ...state,
        usersList: action.payload,
        isLoading: false
      }
    
    case GET_USERS_REQ:
      return {
          ...state,
          isLoading: true
      }

    case GET_USERS_ERR:
      return {
          ...state,
          isLoading: false
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
        vhtList: action.payload,
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

export default combineReducers({ currentUser: userReducer,
                                 registerStatus: registerStatusReducer,
                                 allUsers: allUsersReducer,
                                 allVhts: allVhtsReducer})