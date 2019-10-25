import { combineReducers } from "redux"

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

export default combineReducers({ currentUser: userReducer, registerStatus: registerStatusReducer})