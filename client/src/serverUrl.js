console.log("process.env.NODE_ENV", process.env.NODE_ENV);
console.log("process.env.REACT_APP_USE_LEGACY_SERVER", process.env.REACT_APP_USE_LEGACY_SERVER);
console.log("process.env.REACT_APP_USE_STAGING_SERVER", process.env.REACT_APP_USE_STAGING_SERVER);
// set the default API URL to the staging server 
let BASE_URL = "https://cradle.eastus.cloudapp.azure.com:4443/api"
if (process.env.NODE_ENV == "development") {
    BASE_URL = "http://localhost:5000/api"
}
if (process.env.NODE_ENV == "production") {
    BASE_URL = "https://cradle.eastus.cloudapp.azure.com/api"
}
if (process.env.REACT_APP_USE_LEGACY_SERVER == 1) {
    BASE_URL = "https://cmpt373.csil.sfu.ca:8048/api"
}
if (process.env.REACT_APP_USE_STAGING_SERVER == 1) {
    BASE_URL = "https://cradle.eastus.cloudapp.azure.com:4443/api"
}
if (process.env.REACT_APP_CUSTOM_URL) {
    BASE_URL = `${process.env.REACT_APP_CUSTOM_URL}/api`
}
export default BASE_URL