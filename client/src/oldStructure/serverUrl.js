// set the default API URL to the staging server
let BASE_URL = '/api'

if (process.env.NODE_ENV == 'development') {
  BASE_URL = 'http://localhost:5000/api';
}

if (process.env.REACT_APP_CUSTOM_URL) {
  BASE_URL = `${process.env.REACT_APP_CUSTOM_URL}/api`
}

export default BASE_URL

