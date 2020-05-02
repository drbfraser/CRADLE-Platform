console.log("process.env.NODE_ENV", process.env.NODE_ENV);

let BASE_URL;

if (process.env.NODE_ENV == "production") {
    if (process.env.REACT_APP_USE_LEGACY_SERVER == 1) {
        BASE_URL = "https://cmpt373.csil.sfu.ca:8048/api"
    } else {
        BASE_URL = "https://cradle.eastus.cloudapp.azure.com/api"
    }
} else {
    BASE_URL = "http://localhost:5000/api"
}

export default BASE_URL