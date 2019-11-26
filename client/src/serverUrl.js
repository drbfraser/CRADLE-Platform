console.log("process.env.NODE_ENV", process.env.NODE_ENV);

let BASE_URL;

if(process.env.NODE_ENV == "production") {
    BASE_URL = "https://cmpt373.csil.sfu.ca:8048/api"
} else {
    // BASE_URL = "http://localhost:5000/api"
    BASE_URL = "https://cmpt373.csil.sfu.ca:8048/api"
}

export default BASE_URL