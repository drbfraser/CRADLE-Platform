import { push } from 'connected-react-router'
import axios from 'axios';

import BASE_URL from '../serverUrl'

export const GET_USERS_SUCCESS = 'users/GET_USERS_SUCCESS'
export const GET_USERS_REQ  = 'users/GET_USERS_REQ'
export const GET_USERS_ERR = 'users/GET_USERS_ERR'

export const UPDATE_USERS_SUCCESS = 'users/UPDATE_USERS_SUCCESS'
export const UPDATE_USERS_REQ  = 'users/UPDATE_USERS_REQ'
export const UPDATE_USERS_ERR = 'users/UPDATE_USERS_ERR'

export const userPostFetch = user => {
  return dispatch => {
    return fetch(BASE_URL + "/user/register", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(user)
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.message) {
          dispatch(registerError(data.message))
        } else {
          dispatch(registerSuccess())
        }
      })
  }
}

export const userLoginFetch = user => {
  return dispatch => {
    return fetch(BASE_URL + "/user/auth", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(user)
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.message) {
          // Invalid post raise an error, i.e. password not filled
          console.log(data.message)
        } else {
          localStorage.setItem("token", data.token);
          dispatch(getCurrentUser()).then(() => {
            dispatch(push('/patients'))
          })
        }
      })
  }
}

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
  return dispatch => {
    dispatch({
      type: GET_USERS_REQ
    })

    axios.get(BASE_URL + "/user/all").then((res) => {
        console.log("get users res: ", res);
        dispatch({
            type: GET_USERS_SUCCESS,
            payload: res.data
        })
    }).catch(err => {
        console.log(err);
        dispatch({
            type: GET_USERS_ERR
        })
    })
  }
}

export const updateUser = (userId, data) => {
  return dispatch => {
      dispatch({
          type: UPDATE_USERS_REQ
      })

      return axios.put(BASE_URL + "/user/edit/"+ userId, data).then((res) => {
          dispatch({
              type: UPDATE_USERS_SUCCESS,
              payload: res.data
          })
          console.log("UPDATE PATIENT DATA", res.data)
      })
      .then( () => dispatch(getUsers()))
      .catch(err => {
          console.log(err);
          dispatch({
              type: UPDATE_USERS_ERR
          })
      })
  }
}

export const logoutUser = () => {
  return dispatch => {
    localStorage.removeItem("token")
    dispatch(logoutUserAction())
    dispatch(push('/login'))
  }
}

const logoutUserAction = () => ({
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

const invalidUser = () => ({
  type: 'INVALID_USER'
})