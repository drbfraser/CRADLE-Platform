// Set the default API URL to the staging server
let URL = `https://cradle.eastus.cloudapp.azure.com:4443/api`;

if (process.env.NODE_ENV == `development`) {
  URL = `http://localhost:5000/api`;
}

if (process.env.NODE_ENV == `production`) {
  URL = `https://cradle.eastus.cloudapp.azure.com/api`;
}

if (process.env.REACT_APP_USE_LEGACY_SERVER == 1) {
  URL = `https://cmpt373.csil.sfu.ca:8048/api`;
}

if (process.env.REACT_APP_USE_STAGING_SERVER == 1) {
  URL = `https://cradle.eastus.cloudapp.azure.com:4443/api`;
}

if (process.env.REACT_APP_CUSTOM_URL) {
  URL = `${process.env.REACT_APP_CUSTOM_URL}/api`;
}

export const BASE_URL = URL;
