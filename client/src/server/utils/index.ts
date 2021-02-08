// Set the default API URL to be relative to the current url.
let URL = `/api`;

if (process.env.NODE_ENV === `development`) {
  URL = `http://${window.location.hostname}:5000/api`;
}

export const BASE_URL = URL;
