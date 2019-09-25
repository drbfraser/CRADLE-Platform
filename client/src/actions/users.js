import { push } from 'connected-react-router'

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
          // TODO: check for status code
          dispatch(userLoginFetch(user)).then(() => { // log the user in
            dispatch(push('/patients'))
          }) 
        } else {

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
          console.log(data)
        } else {
          localStorage.setItem("token", data.token)
          dispatch(loginUser(data))
          dispatch(push('/patients'))
        }
      })
  }
}

export const getCurrentUser = () => {
  return dispatch => {
    const token = localStorage.token;
    if (token) {
      return fetch("http://localhost:5000/user/current", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.message) {
            // invalid token, remove current token
            localStorage.removeItem("token")
            dispatch(push('/login'))
          } else {
            dispatch(loginUser(data))
          }
        })
    } else {
      // no token, go to login
      dispatch(push('/login'))
    }
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