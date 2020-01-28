import BASE_URL from '../serverUrl'
import jwt_decode from 'jwt-decode'
import axios from 'axios';
import { ActionType } from '../actions/types';

export default function requestMiddleware() {
    return ({ dispatch }) => next => (action) => {
      next(action)
  
      if (action.type !== ActionType.API) {
        return
      }

      const token = localStorage.token;
      const {
        endpoint,
        method,
        data,
        onSuccess,
        onError,
      } = action.payload;
      axios({
        method: method,
        url: BASE_URL + endpoint,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: data
      }).then((res) => {
          console.log("get patients res: ", res);
          dispatch(onSuccess(res))
      }).catch(err => {
          console.log(err);
          dispatch(onError(err))
      })
      // const accessToken = localStorage.token;
      // const refreshToken = localStorage.refresh;
      // const {
      //   url,
      //   method,
      //   data,
      //   accessToken,
      //   onSuccess,
      //   onFailure,
      //   label,
      //   headers
      // } = action.payload;
      
      // const dataOrParams = ["GET", "DELETE"].includes(method) ? "params" : "data";
      
      
      // // axios default configs
      // axios.defaults.baseURL = process.env.REACT_APP_BASE_URL || "";
      // axios.defaults.headers.common["Content-Type"]="application/json";
      // axios.defaults.headers.common["Authorization"] = `Bearer${token}`;
    
    
      // if (label) {
      //   dispatch(apiStart(label));
      // }
    
      // axios
      //   .request({
      //     url,
      //     method,
      //     headers,
      //     [dataOrParams]: data
      //   })
      //   .then(({ data }) => {
      //     dispatch(onSuccess(data));
      //   })
      //   .catch(error => {
      //     dispatch(apiError(error));
      //     dispatch(onFailure(error));
    
      //     if (error.response && error.response.status === 403) {
      //       dispatch(accessDenied(window.location.pathname));
      //     }
      //   })
      //  .finally(() => {
      //     if (label) {
      //       dispatch(apiEnd(label));
      //     }
      //  });
  
    //   // 5 minutes from now
    //   const refreshThreshold = (new Date.getTime() + 300000);
  
    //   if (refreshToken && refreshThreshold > accessToken.expires_at) {
    //     return superagent.post('/path/to/renew')
    //       .send({ refresh_token: tokens.refresh_token })
    //       .end((err, { body } = {}) => {
    //         dispatch({ type: 'SET_TOKENS', payload: body });
    //         request(body);
    //       });
    //       return axios.post(BASE_URL + `/user/auth/refresh`, data, {
    //         'headers': {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //             'Authorization': `Bearer ${refreshToken}`
    //         }
    //     }).then()
    //   }
    };
  }