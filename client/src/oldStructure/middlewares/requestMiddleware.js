import BASE_URL from '../serverUrl'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import { ActionType } from '../actions/types'
import { Endpoint, Method } from '../api/constants'
import { logoutUserAction } from '../actions/users'
import { go } from 'connected-react-router'

export default function requestMiddleware() {
  return ({ dispatch }) => next => async action => {
    next(action)

    if (action.type !== ActionType.API) {
      return
    }

    let token = localStorage.token
    const decodedToken = token && jwt_decode(token)
    const currTime = new Date().getTime() / 1000
    const { endpoint, method, data, onSuccess, onError } = action.payload

    // if token has expired, renew token
    if (
      decodedToken &&
      currTime > decodedToken.exp &&
      endpoint !== Endpoint.USER + Endpoint.AUTH
    ) {
      const refreshToken = localStorage.refresh
      try {
        const response = await axios({
          method: Method.POST,
          url: BASE_URL + Endpoint.USER + Endpoint.AUTH + Endpoint.REFRESH,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${refreshToken}`
          }
        })
        localStorage.setItem('token', response.data.token)
        token = localStorage.token
      } catch (error) {
        console.log(error)
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        dispatch(logoutUserAction())
        dispatch(go('/login'))
        return
      }
    }
    axios({
      method: method,
      url: BASE_URL + endpoint,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      data: data
    })
      .then(res => {
        console.log('response: ', res)
        dispatch(onSuccess(res))
      })
      .catch(err => {
        console.log('error: ', err)
        dispatch(onError(err))
      })
  }
}
