import { push } from 'connected-react-router'
import axios from 'axios';

export const userPostFetch = user => {
  return dispatch => {
    return fetch("http://localhost:5000/user/register", {
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
          // TODO: do something with error message
          console.log(data)
        } else {
          dispatch(userLoginFetch(user)).then(() => { // log the user in
            dispatch(push('/patients'))
          }) 
        }
      })
  }
}

export const userLoginFetch = user => {
  return dispatch => {
    return fetch("http://localhost:5000/user/auth", {
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
      return axios.get("http://localhost:5000/user/current", {
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
        } )
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

const invalidUser = () => ({
  type: 'INVALID_USER'
})