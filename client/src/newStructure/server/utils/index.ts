// Set the default API URL to be relative to the current url.
let URL = `/api`;

if (process.env.NODE_ENV === `development`) {
  URL = `http://localhost:5000/api`;
}

if (process.env.REACT_APP_CUSTOM_URL) {
  URL = `${process.env.REACT_APP_CUSTOM_URL}/api`;
}

export const BASE_URL = URL;
